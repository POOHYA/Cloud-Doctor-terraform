# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

고객사 CloudDoctorAuditRole 역할
권한정책

---

{
"Version": "2012-10-17",
"Statement": [
{
"Effect": "Allow",
"Action": "sts:AssumeRole",
"Resource": "arn:aws:iam::346448660196:role/CloudDoctorAuditRole"
},
{
"Effect": "Allow",
"Action": [
"iam:GetAccountSummary",
"iam:ListUsers",
"iam:ListAccessKeys",
"iam:ListMFADevices",
"iam:ListRoles",
"iam:ListUserPolicies",
"iam:ListAttachedUserPolicies",
"iam:ListRolePolicies",
"iam:ListAttachedRolePolicies",
"iam:GetUserPolicy",
"iam:GetRolePolicy",
"iam:GetPolicy",
"iam:GetPolicyVersion",
"s3:ListAllMyBuckets",
"s3:GetBucketPolicy",
"s3:GetBucketAcl",
"ec2:DescribeInstances",
"ec2:DescribeImages",
"ec2:DescribeSnapshots",
"ec2:DescribeSnapshotAttribute",
"ec2:DescribeSecurityGroups",
"ec2:DescribeSubnets",
"ec2:DescribeRouteTables",
"kms:ListKeys",
"kms:DescribeKey",
"kms:GetKeyPolicy",
"cloudformation:DescribeStacks",
"cloudtrail:DescribeTrails",
"cloudtrail:GetEventSelectors",
"cloudtrail:GetTrailStatus",
"rds:DescribeDBInstances",
"rds:DescribeDBSnapshots",
"rds:DescribeDBSnapshotAttributes",
"rds:DescribeDBClusters",
"rds:DescribeDBClusterSnapshots",
"rds:DescribeDBClusterSnapshotAttributes",
"rds:DescribeDBSubnetGroups",
"sns:ListTopics",
"sns:GetTopicAttributes"
],
"Resource": "\*"
}
]
}

---

신뢰정책

{
"Version": "2012-10-17",
"Statement": [
{
"Effect": "Allow",
"Principal": {
"AWS": "arn:aws:iam::346448660196:root"
},
"Action": "sts:AssumeRole",
"Condition": {}
}
]
}

---
