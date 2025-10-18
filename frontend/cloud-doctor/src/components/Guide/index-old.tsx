import { Link } from "react-router-dom";

export default function Index() {
  return (
    <main>
      <section
        id="Guide"
        className="min-h-screen bg-gradient-to-br from-primary-dark via-primary to-primary-dark py-12"
      >
        <div className="p-6 max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-beige to-primary-light bg-clip-text text-transparent">
            📖 AWS 보안 가이드
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to={`/guide/ec2`}
              className="block p-4 bg-primary-dark/50 backdrop-blur-xl border border-primary rounded-2xl shadow-xl hover:bg-primary-dark/70 hover:border-accent transition-all hover:scale-105"
            >
              <div className="flex items-center gap-4">
                <img
                  className="w-24 h-24 rounded-lg object-cover"
                  alt=""
                  src="/img/ec2.png"
                />
                <div>
                  <h3 className="text-lg font-bold text-beige mb-1">EC2</h3>
                  <p className="text-sm text-slate-400">6 항목</p>
                  <p className="text-sm text-slate-400">
                    사고사례 및 공격기법 41건
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to={`/guide/s3`}
              className="block p-4 bg-primary-dark/50 backdrop-blur-xl border border-primary rounded-2xl shadow-xl hover:bg-primary-dark/70 hover:border-accent transition-all hover:scale-105"
            >
              <div className="flex items-center gap-4">
                <img
                  className="w-24 h-24 rounded-lg object-cover"
                  alt=""
                  src="/img/s3.png"
                />
                <div>
                  <h3 className="text-xl font-bold text-beige mb-2">S3</h3>
                  <p className="text-sm text-slate-400">3 항목</p>
                  <p className="text-sm text-slate-400">
                    사고사례 및 공격기법 20건
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to={`/guide/iam`}
              className="block p-4 bg-primary-dark/50 backdrop-blur-xl border border-primary rounded-2xl shadow-xl hover:bg-primary-dark/70 hover:border-accent transition-all hover:scale-105"
            >
              <div className="flex items-center gap-4">
                <img
                  className="w-24 h-24 rounded-lg object-cover"
                  alt=""
                  src="/img/iam.png"
                />
                <div>
                  <h3 className="text-xl font-bold text-beige mb-2">IAM</h3>
                  <p className="text-sm text-slate-400">9 항목</p>
                  <p className="text-sm text-slate-400">
                    사고사례 및 공격기법 152건
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to={`/guide/vpc`}
              className="block p-4 bg-primary-dark/50 backdrop-blur-xl border border-primary rounded-2xl shadow-xl hover:bg-primary-dark/70 hover:border-accent transition-all hover:scale-105"
            >
              <div className="flex items-center gap-4">
                <img
                  className="w-24 h-24 rounded-lg object-cover"
                  alt=""
                  src="/img/vpc.png"
                />
                <div>
                  <h3 className="text-xl font-bold text-beige mb-2">VPC</h3>
                  <p className="text-sm text-slate-400">2 항목</p>
                  <p className="text-sm text-slate-400">
                    사고사례 및 공격기법 5건
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to={`/guide/lambda`}
              className="block p-4 bg-primary-dark/50 backdrop-blur-xl border border-primary rounded-2xl shadow-xl hover:bg-primary-dark/70 hover:border-accent transition-all hover:scale-105"
            >
              <div className="flex items-center gap-4">
                <img
                  className="w-24 h-24 rounded-lg object-cover"
                  alt=""
                  src="/img/lambda.png"
                />
                <div>
                  <h3 className="text-xl font-bold text-beige mb-2">Lambda</h3>
                  <p className="text-sm text-slate-400">2 항목</p>
                  <p className="text-sm text-slate-400">
                    사고사례 및 공격기법 5건
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to={`/guide/rds`}
              className="block p-4 bg-primary-dark/50 backdrop-blur-xl border border-primary rounded-2xl shadow-xl hover:bg-primary-dark/70 hover:border-accent transition-all hover:scale-105"
            >
              <div className="flex items-center gap-4">
                <img
                  className="w-24 h-24 rounded-lg object-cover"
                  alt=""
                  src="/img/rds.png"
                />
                <div>
                  <h3 className="text-xl font-bold text-beige mb-2">RDS</h3>
                  <p className="text-sm text-slate-400">2 항목</p>
                  <p className="text-sm text-slate-400">
                    사고사례 및 공격기법 6건
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to={`/guide/cloudtrail`}
              className="block p-4 bg-primary-dark/50 backdrop-blur-xl border border-primary rounded-2xl shadow-xl hover:bg-primary-dark/70 hover:border-accent transition-all hover:scale-105"
            >
              <div className="flex items-center gap-4">
                <img
                  className="w-24 h-24 rounded-lg object-cover"
                  alt=""
                  src="/img/cloudtrail.png"
                />
                <div>
                  <h3 className="text-xl font-bold text-beige mb-2">
                    CloudTrail
                  </h3>
                  <p className="text-sm text-slate-400">2 항목</p>
                  <p className="text-sm text-slate-400">
                    사고사례 및 공격기법 5건
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to={`/guide/eks`}
              className="block p-4 bg-primary-dark/50 backdrop-blur-xl border border-primary rounded-2xl shadow-xl hover:bg-primary-dark/70 hover:border-accent transition-all hover:scale-105"
            >
              <div className="flex items-center gap-4">
                <img
                  className="w-24 h-24 rounded-lg object-cover"
                  alt=""
                  src="/img/eks.png"
                />
                <div>
                  <h3 className="text-xl font-bold text-beige mb-2">EKS</h3>
                  <p className="text-sm text-slate-400">1 항목</p>
                  <p className="text-sm text-slate-400">
                    사고사례 및 공격기법 7건
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to={`/guide/kms`}
              className="block p-4 bg-primary-dark/50 backdrop-blur-xl border border-primary rounded-2xl shadow-xl hover:bg-primary-dark/70 hover:border-accent transition-all hover:scale-105"
            >
              <div className="flex items-center gap-4">
                <img
                  className="w-24 h-24 rounded-lg object-cover"
                  alt=""
                  src="/img/kms.png"
                />
                <div>
                  <h3 className="text-xl font-bold text-beige mb-2">KMS</h3>
                  <p className="text-sm text-slate-400">1 항목</p>
                  <p className="text-sm text-slate-400">
                    사고사례 및 공격기법 3건
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to={`/guide/sns`}
              className="block p-4 bg-primary-dark/50 backdrop-blur-xl border border-primary rounded-2xl shadow-xl hover:bg-primary-dark/70 hover:border-accent transition-all hover:scale-105"
            >
              <div className="flex items-center gap-4">
                <img
                  className="w-24 h-24 rounded-lg object-cover"
                  alt=""
                  src="/img/sns.png"
                />
                <div>
                  <h3 className="text-xl font-bold text-beige mb-2">SNS</h3>
                  <p className="text-sm text-slate-400">1 항목</p>
                  <p className="text-sm text-slate-400">
                    사고사례 및 공격기법 3건
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to={`/guide/sqs`}
              className="block p-4 bg-primary-dark/50 backdrop-blur-xl border border-primary rounded-2xl shadow-xl hover:bg-primary-dark/70 hover:border-accent transition-all hover:scale-105"
            >
              <div className="flex items-center gap-4">
                <img
                  className="w-24 h-24 rounded-lg object-cover"
                  alt=""
                  src="/img/sqs.png"
                />
                <div>
                  <h3 className="text-xl font-bold text-beige mb-2">SQS</h3>
                  <p className="text-sm text-slate-400">1 항목</p>
                  <p className="text-sm text-slate-400">
                    사고사례 및 공격기법 2건
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to={`/guide/route53`}
              className="block p-4 bg-primary-dark/50 backdrop-blur-xl border border-primary rounded-2xl shadow-xl hover:bg-primary-dark/70 hover:border-accent transition-all hover:scale-105"
            >
              <div className="flex items-center gap-4">
                <img
                  className="w-24 h-24 rounded-lg object-cover"
                  alt=""
                  src="/img/route53.png"
                />
                <div>
                  <h3 className="text-xl font-bold text-beige mb-2">Route53</h3>
                  <p className="text-sm text-slate-400">1 항목</p>
                  <p className="text-sm text-slate-400">
                    사고사례 및 공격기법 7건
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to={`/guide/organizations`}
              className="block p-4 bg-primary-dark/50 backdrop-blur-xl border border-primary rounded-2xl shadow-xl hover:bg-primary-dark/70 hover:border-accent transition-all hover:scale-105"
            >
              <div className="flex items-center gap-4">
                <img
                  className="w-24 h-24 rounded-lg object-cover"
                  alt=""
                  src="/img/organizations.png"
                />
                <div>
                  <h3 className="text-xl font-bold text-beige mb-2">
                    Organizations
                  </h3>
                  <p className="text-sm text-slate-400">2 항목</p>
                  <p className="text-sm text-slate-400">
                    사고사례 및 공격기법 4건
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to={`/guide/ecr`}
              className="block p-4 bg-primary-dark/50 backdrop-blur-xl border border-primary rounded-2xl shadow-xl hover:bg-primary-dark/70 hover:border-accent transition-all hover:scale-105"
            >
              <div className="flex items-center gap-4">
                <img
                  className="w-24 h-24 rounded-lg object-cover"
                  alt=""
                  src="/img/ecr.png"
                />
                <div>
                  <h3 className="text-xl font-bold text-beige mb-2">ECR</h3>
                  <p className="text-sm text-slate-400">1 항목</p>
                  <p className="text-sm text-slate-400">
                    사고사례 및 공격기법 3건
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to={`/guide/ssm`}
              className="block p-4 bg-primary-dark/50 backdrop-blur-xl border border-primary rounded-2xl shadow-xl hover:bg-primary-dark/70 hover:border-accent transition-all hover:scale-105"
            >
              <div className="flex items-center gap-4">
                <img
                  className="w-24 h-24 rounded-lg object-cover"
                  alt=""
                  src="/img/ssm.png"
                />
                <div>
                  <h3 className="text-xl font-bold text-beige mb-2">SSM</h3>
                  <p className="text-sm text-slate-400">2 항목</p>
                  <p className="text-sm text-slate-400">
                    사고사례 및 공격기법 4건
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to={`/guide/guardduty`}
              className="block p-4 bg-primary-dark/50 backdrop-blur-xl border border-primary rounded-2xl shadow-xl hover:bg-primary-dark/70 hover:border-accent transition-all hover:scale-105"
            >
              <div className="flex items-center gap-4">
                <img
                  className="w-24 h-24 rounded-lg object-cover"
                  alt=""
                  src="/img/guardduty.png"
                />
                <div>
                  <h3 className="text-xl font-bold text-beige mb-2">
                    GuardDuty
                  </h3>
                  <p className="text-sm text-slate-400">1 항목</p>
                  <p className="text-sm text-slate-400">
                    사고사례 및 공격기법 3건
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to={`/guide/cognito`}
              className="block p-4 bg-primary-dark/50 backdrop-blur-xl border border-primary rounded-2xl shadow-xl hover:bg-primary-dark/70 hover:border-accent transition-all hover:scale-105"
            >
              <div className="flex items-center gap-4">
                <img
                  className="w-24 h-24 rounded-lg object-cover"
                  alt=""
                  src="/img/cognito.png"
                />
                <div>
                  <h3 className="text-xl font-bold text-beige mb-2">Cognito</h3>
                  <p className="text-sm text-slate-400">3 항목</p>
                  <p className="text-sm text-slate-400">
                    사고사례 및 공격기법 9건
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to={`/guide/cloudformation`}
              className="block p-4 bg-primary-dark/50 backdrop-blur-xl border border-primary rounded-2xl shadow-xl hover:bg-primary-dark/70 hover:border-accent transition-all hover:scale-105"
            >
              <div className="flex items-center gap-4">
                <img
                  className="w-24 h-24 rounded-lg object-cover"
                  alt=""
                  src="/img/cloudformation.png"
                />
                <div>
                  <h3 className="text-xl font-bold text-beige mb-2">
                    CloudFormation
                  </h3>
                  <p className="text-sm text-slate-400">1 항목</p>
                  <p className="text-sm text-slate-400">
                    사고사례 및 공격기법 4건
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to={`/guide/opensearch`}
              className="block p-4 bg-primary-dark/50 backdrop-blur-xl border border-primary rounded-2xl shadow-xl hover:bg-primary-dark/70 hover:border-accent transition-all hover:scale-105"
            >
              <div className="flex items-center gap-4">
                <img
                  className="w-24 h-24 rounded-lg object-cover"
                  alt=""
                  src="/img/opensearch.png"
                />
                <div>
                  <h3 className="text-xl font-bold text-beige mb-2">
                    OpenSearch
                  </h3>
                  <p className="text-sm text-slate-400">1 항목</p>
                  <p className="text-sm text-slate-400">
                    사고사례 및 공격기법 2건
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to={`/guide/elasticbeanstalk`}
              className="block p-4 bg-primary-dark/50 backdrop-blur-xl border border-primary rounded-2xl shadow-xl hover:bg-primary-dark/70 hover:border-accent transition-all hover:scale-105"
            >
              <div className="flex items-center gap-4">
                <img
                  className="w-24 h-24 rounded-lg object-cover"
                  alt=""
                  src="/img/elasticbeanstalk.png"
                />
                <div>
                  <h3 className="text-xl font-bold text-beige mb-2">
                    Elastic Beanstalk
                  </h3>
                  <p className="text-sm text-slate-400">1 항목</p>
                  <p className="text-sm text-slate-400">
                    사고사례 및 공격기법 3건
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to={`/guide/redshift`}
              className="block p-4 bg-primary-dark/50 backdrop-blur-xl border border-primary rounded-2xl shadow-xl hover:bg-primary-dark/70 hover:border-accent transition-all hover:scale-105"
            >
              <div className="flex items-center gap-4">
                <img
                  className="w-24 h-24 rounded-lg object-cover"
                  alt=""
                  src="/img/redshift.png"
                />
                <div>
                  <h3 className="text-xl font-bold text-beige mb-2">
                    Redshift
                  </h3>
                  <p className="text-sm text-slate-400">1 항목</p>
                  <p className="text-sm text-slate-400">
                    사고사례 및 공격기법 2건
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to={`/guide/glue`}
              className="block p-4 bg-primary-dark/50 backdrop-blur-xl border border-primary rounded-2xl shadow-xl hover:bg-primary-dark/70 hover:border-accent transition-all hover:scale-105"
            >
              <div className="flex items-center gap-4">
                <img
                  className="w-24 h-24 rounded-lg object-cover"
                  alt=""
                  src="/img/glue.png"
                />
                <div>
                  <h3 className="text-xl font-bold text-beige mb-2">Glue</h3>
                  <p className="text-sm text-slate-400">1 항목</p>
                  <p className="text-sm text-slate-400">
                    사고사례 및 공격기법 3건
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to={`/guide/servicecatalog`}
              className="block p-4 bg-primary-dark/50 backdrop-blur-xl border border-primary rounded-2xl shadow-xl hover:bg-primary-dark/70 hover:border-accent transition-all hover:scale-105"
            >
              <div className="flex items-center gap-4">
                <img
                  className="w-24 h-24 rounded-lg object-cover"
                  alt=""
                  src="/img/servicecatalog.png"
                />
                <div>
                  <h3 className="text-xl font-bold text-beige mb-2">
                    Service Catalog
                  </h3>
                  <p className="text-sm text-slate-400">1 항목</p>
                  <p className="text-sm text-slate-400">
                    사고사례 및 공격기법 3건
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to={`/guide/documentdb`}
              className="block p-4 bg-primary-dark/50 backdrop-blur-xl border border-primary rounded-2xl shadow-xl hover:bg-primary-dark/70 hover:border-accent transition-all hover:scale-105"
            >
              <div className="flex items-center gap-4">
                <img
                  className="w-24 h-24 rounded-lg object-cover"
                  alt=""
                  src="/img/documentDB.png"
                />
                <div>
                  <h3 className="text-xl font-bold text-beige mb-2">
                    DocumentDB
                  </h3>
                  <p className="text-sm text-slate-400">1 항목</p>
                  <p className="text-sm text-slate-400">
                    사고사례 및 공격기법 2건
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to={`/guide/bedrock`}
              className="block p-4 bg-primary-dark/50 backdrop-blur-xl border border-primary rounded-2xl shadow-xl hover:bg-primary-dark/70 hover:border-accent transition-all hover:scale-105"
            >
              <div className="flex items-center gap-4">
                <img
                  className="w-24 h-24 rounded-lg object-cover"
                  alt=""
                  src="/img/bedrock.png"
                />
                <div>
                  <h3 className="text-xl font-bold text-beige mb-2">Bedrock</h3>
                  <p className="text-sm text-slate-400">1 항목</p>
                  <p className="text-sm text-slate-400">
                    사고사례 및 공격기법 4건
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to={`/guide/ses`}
              className="block p-4 bg-primary-dark/50 backdrop-blur-xl border border-primary rounded-2xl shadow-xl hover:bg-primary-dark/70 hover:border-accent transition-all hover:scale-105"
            >
              <div className="flex items-center gap-4">
                <img
                  className="w-24 h-24 rounded-lg object-cover"
                  alt=""
                  src="/img/ses.png"
                />
                <div>
                  <h3 className="text-xl font-bold text-beige mb-2">SES</h3>
                  <p className="text-sm text-slate-400">1 항목</p>
                  <p className="text-sm text-slate-400">
                    사고사례 및 공격기법 2건
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to={`/guide/appstream 2.0`}
              className="block p-4 bg-primary-dark/50 backdrop-blur-xl border border-primary rounded-2xl shadow-xl hover:bg-primary-dark/70 hover:border-accent transition-all hover:scale-105"
            >
              <div className="flex items-center gap-4">
                <img
                  className="w-24 h-24 rounded-lg object-cover"
                  alt=""
                  src="/img/appstream2.0.png"
                />
                <div>
                  <h3 className="text-xl font-bold text-beige mb-2">
                    AppStream 2.0
                  </h3>
                  <p className="text-sm text-slate-400">1 항목</p>
                  <p className="text-sm text-slate-400">
                    사고사례 및 공격기법 2건
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export { Index as Guide };
