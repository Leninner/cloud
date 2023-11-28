import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { readFileSync } from "fs";

export class ReplicationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Set up the default VPC for the region
    const vpc = ec2.Vpc.fromLookup(this, "VPC", {
      isDefault: true,
    });

    // Create a security group with all outbound traffic allowed
    const securityGroup = new ec2.SecurityGroup(this, "SecurityGroup", {
      vpc,
      description: "Allow SSH (TCP port 22) and HTTP (TCP port 80) in",
      allowAllOutbound: true,
    });

    // Allow SSH and HTTP traffic in from anywhere
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      "Allow SSH access from the world"
    );

    // Allow MySQL traffic in from anywhere
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(3306),
      "Allow MySQL access from the world"
    );

    // Allow MySQL Group Replication traffic in from anywhere
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(33061),
      "Allow MySQL Group Replication access from the world"
    );

    // Create an Amazon Machine image
    const ami = new ec2.AmazonLinuxImage({
      generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      cpuType: ec2.AmazonLinuxCpuType.X86_64,
    });

    // Create three EC2 instances using the AMI and Security Group and also using a EBS Volume of 1GB
    const instanceSqlOne = new ec2.Instance(this, "InstanceSqlOne", {
      vpc,
      instanceType: new ec2.InstanceType("t2.micro"),
      machineImage: ami,
      securityGroup,
      blockDevices: [
        {
          deviceName: "/dev/xvda",
          volume: ec2.BlockDeviceVolume.ebs(1, { deleteOnTermination: true }),
        },
      ],
    });

    const instanceSqlTwo = new ec2.Instance(this, "InstanceSqlTwo", {
      vpc,
      instanceType: new ec2.InstanceType("t2.micro"),
      machineImage: ami,
      securityGroup,
      blockDevices: [
        {
          deviceName: "/dev/xvda",
          volume: ec2.BlockDeviceVolume.ebs(1, { deleteOnTermination: true }),
        },
      ]
    });

    const instanceSqlThree = new ec2.Instance(this, "InstanceSqlThree", {
      vpc,
      instanceType: new ec2.InstanceType("t2.micro"),
      machineImage: ami,
      securityGroup,
      blockDevices: [
        {
          deviceName: "/dev/xvda",
          volume: ec2.BlockDeviceVolume.ebs(1, { deleteOnTermination: true }),
        },
      ]
    });

    // Read the user data script from the file system
    const userData = readFileSync("./data/user-data-sql.sh", "utf8");

    // Add the user data script to the instances
    instanceSqlOne.addUserData(userData);
    instanceSqlTwo.addUserData(userData);
    instanceSqlThree.addUserData(userData);
  }
}
