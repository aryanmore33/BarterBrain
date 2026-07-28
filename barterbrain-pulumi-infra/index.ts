import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

// Create an AWS resource (S3 Bucket)
const bucket = new aws.s3.Bucket("my-bucket");
const instance = new aws.ec2.Instance("my-instance", {
    ami: "ami-007855ac798b5175e",
    instanceType: "t3.micro"
})
// Export the name of the bucket
export const bucketName = bucket.id;
