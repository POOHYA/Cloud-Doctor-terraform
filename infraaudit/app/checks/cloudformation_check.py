from .base_check import BaseCheck
from typing import List, Dict, Any

CF_CREATE_ACTIONS = {"cloudformation:createstack"}
PASSROLE_ACTIONS   = {"iam:passrole"}

def _normalize_to_list(x):
    if x is None:
        return []
    if isinstance(x, list):
        return x
    return [x]

def _actions_include(actions: List[str], targets: set) -> bool:
    """actions에 targets(소문자)이 포함되었는지, 혹은 와일드카드로 대체되는지 확인"""
    for a in _normalize_to_list(actions):
        a_l = a.lower()
        if a_l == "*" or a_l.startswith("cloudformation:") and any(t.startswith("cloudformation:") for t in targets):
            # cloudformation:* or * 는 CreateStack 포함 가능 (명시 타깃이 CF인 경우)
            return True
        if a_l.startswith("iam:") and any(t.startswith("iam:") for t in targets):
            # iam:* 도 passrole 포함 가능
            return True
        if a_l in targets:
            return True
    return False

def _resource_has_star(resources: List[str]) -> bool:
    for r in _normalize_to_list(resources):
        if r == "*":
            return True
    return False

class IAMRoleCloudFormationPassRoleCheck(BaseCheck):
    async def check(self) -> List[Dict]:
        iam = self.session.client('iam')
        results: List[Dict] = []
        raw: List[Dict] = []

        try:
            # ----- list_roles: 페이지네이션 -----
            roles: List[Dict[str, Any]] = []
            paginator = iam.get_paginator("list_roles")
            for page in paginator.paginate():
                roles.extend(page.get("Roles", []))

            if not roles:
                results.append(self.get_result('PASS', 'N/A', "IAM 역할이 존재하지 않습니다."))
                return {'results': results, 'raw': raw, 'guideline_id': 41}

            for role in roles:
                role_name = role["RoleName"]

                # 집계 변수 초기화
                has_cf_create = False
                has_passrole  = False
                passrole_has_star = False  # 핵심: PassRole 리소스가 '*' 인지
                vulnerable_policies: List[str] = []
                policy_documents: List[Dict] = []
                all_policy_documents: List[Dict] = []

                try:
                    # ----- 관리형 정책: 페이지네이션 -----
                    attached = []
                    paginator = iam.get_paginator("list_attached_role_policies")
                    for page in paginator.paginate(RoleName=role_name):
                        attached.extend(page.get("AttachedPolicies", []))

                    # 각 관리형 정책 → 버전 → 문서
                    for ap in attached:
                        try:
                            pol = iam.get_policy(PolicyArn=ap["PolicyArn"])["Policy"]
                            ver = iam.get_policy_version(
                                PolicyArn=ap["PolicyArn"],
                                VersionId=pol["DefaultVersionId"]
                            )["PolicyVersion"]["Document"]
                            
                            policy_documents.append({
                                'type': 'managed',
                                'name': ap['PolicyName'],
                                'document': ver
                            })
                            
                            # 정책 문서 수집
                            all_policy_documents.append({
                                'type': 'managed',
                                'name': ap['PolicyName'],
                                'arn': ap['PolicyArn'],
                                'document': ver
                            })

                            stmts = _normalize_to_list(ver.get("Statement"))
                            for st in stmts:
                                if st.get("Effect") != "Allow":
                                    continue
                                actions   = _normalize_to_list(st.get("Action"))
                                resources = _normalize_to_list(st.get("Resource"))

                                # CreateStack (또는 cloudformation:* / *) 탐지
                                if _actions_include(actions, CF_CREATE_ACTIONS):
                                    has_cf_create = True

                                # PassRole (또는 iam:*, *) 탐지 + 자원 *
                                if _actions_include(actions, PASSROLE_ACTIONS):
                                    has_passrole = True
                                    if _resource_has_star(resources):
                                        passrole_has_star = True

                            # 조건 충족 시 근거에 정책명 추가
                            if has_cf_create and has_passrole:
                                vulnerable_policies.append(f"{ap['PolicyName']} (managed)")
                        except Exception:
                            # 단일 정책 파싱 실패는 무시하고 다음으로
                            pass

                    # ----- 인라인 정책: 페이지네이션 -----
                    inline_names = []
                    paginator = iam.get_paginator("list_role_policies")
                    for page in paginator.paginate(RoleName=role_name):
                        inline_names.extend(page.get("PolicyNames", []))

                    for pn in inline_names:
                        try:
                            pol = iam.get_role_policy(RoleName=role_name, PolicyName=pn)
                            doc = pol.get("PolicyDocument", {})
                            
                            policy_documents.append({
                                'type': 'inline',
                                'name': pn,
                                'document': doc
                            })
                            
                            # 인라인 정책 문서 수집
                            all_policy_documents.append({
                                'type': 'inline',
                                'name': pn,
                                'document': doc
                            })
                            
                            stmts = _normalize_to_list(doc.get("Statement"))
                            for st in stmts:
                                if st.get("Effect") != "Allow":
                                    continue
                                actions   = _normalize_to_list(st.get("Action"))
                                resources = _normalize_to_list(st.get("Resource"))

                                if _actions_include(actions, CF_CREATE_ACTIONS):
                                    has_cf_create = True
                                if _actions_include(actions, PASSROLE_ACTIONS):
                                    has_passrole = True
                                    if _resource_has_star(resources):
                                        passrole_has_star = True

                            if has_cf_create and has_passrole:
                                vulnerable_policies.append(f"{pn} (inline)")
                        except Exception:
                            pass

                    raw.append({
                        "role_name": role_name,
                        "has_cf_create": has_cf_create,
                        "has_passrole": has_passrole,
                        "passrole_has_star": passrole_has_star,
                        "vulnerable_policies": vulnerable_policies,
                        "policy_documents": policy_documents
                    })

                    # ----- 판정 로직 -----
                    # 위험: CreateStack 가능 + PassRole 가능 + PassRole 리소스가 *
                    if has_cf_create and has_passrole and passrole_has_star:
                        results.append(self.get_result(
                            'FAIL', role_name,
                            ("역할에 CloudFormation:CreateStack과 iam:PassRole이 동시에 있으며 "
                             "iam:PassRole의 Resource가 '*'입니다. 특정 실행 역할 ARN으로 제한하거나 역할 분리를 권장합니다."),
                            {
                                'role_name': role_name,
                                'has_cf_create': has_cf_create,
                                'has_passrole': has_passrole,
                                'passrole_has_star': passrole_has_star,
                                'vulnerable_policies': vulnerable_policies,
                                'policy_documents': policy_documents
                            }
                        ))
                    else:
                        # 상대적으로 안전한 케이스 표시(원하면 INFO/양호 기준 조정)
                        if has_cf_create and has_passrole and not passrole_has_star:
                            results.append(self.get_result(
                                'PASS', role_name,
                                ("CloudFormation:CreateStack과 iam:PassRole이 동시에 있으나, "
                                 "iam:PassRole의 Resource가 특정 ARN으로 제한되어 있습니다."),
                                {
                                    'role_name': role_name,
                                    'has_cf_create': has_cf_create,
                                    'has_passrole': has_passrole,
                                    'passrole_has_star': passrole_has_star,
                                    'policy_documents': policy_documents
                                }
                            ))
                        elif has_cf_create and not has_passrole:
                            results.append(self.get_result(
                                'PASS', role_name,
                                "CreateStack 권한은 있으나 PassRole 권한이 없어 상대적으로 안전합니다(역할 위임 제한).",
                                {
                                    'role_name': role_name,
                                    'has_cf_create': has_cf_create,
                                    'has_passrole': has_passrole,
                                    'policy_documents': policy_documents
                                }
                            ))
                        else:
                            # 둘 다 없거나 관련 없음 → 보고 생략 원하면 INFO로 남겨도 됨
                            pass

                except Exception as e_role:
                    results.append(self.get_result('ERROR', role_name, f"역할 {role_name} 검사 중 오류: {str(e_role)}"))

        except Exception as e:
            results.append(self.get_result('ERROR', 'N/A', str(e)))

        return {'results': results, 'raw': raw, 'guideline_id': 41}
