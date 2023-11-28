import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { readFileSync } from "fs";

export class LoadBalancingAwsStack extends cdk.Stack {
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

    // Allow SSH and HTTP traffic in from anywhere
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      "Allow HTTP access from the world"
    );

    // Create an Amazon Machine image
    const ami = new ec2.AmazonLinuxImage({
      generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      cpuType: ec2.AmazonLinuxCpuType.X86_64,
    });

    // Create an instance for the load balancer
    const loadBalancerInstance = new ec2.Instance(this, "LoadBalancerInstance", {
      vpc,
      instanceType: new ec2.InstanceType("t2.micro"),
      machineImage: ami,
      securityGroup,
    })

    // Create two instances for the web servers
    const webServerInstanceOne = new ec2.Instance(this, "WebServerInstanceOne", {
      vpc,
      instanceType: new ec2.InstanceType("t2.micro"),
      machineImage: ami,
      securityGroup,
    })

    const webServerInstanceTwo = new ec2.Instance(this, "WebServerInstanceTwo", {
      vpc,
      instanceType: new ec2.InstanceType("t2.micro"),
      machineImage: ami,
      securityGroup,
    })

    // Add the user data scripts to the instances
    const userDataLoadBalancer = readFileSync("./data/user-data-load-balancer.sh", "utf8");
    const userDataWordpress = readFileSync("./data/user-data-server.sh", "utf8");

    loadBalancerInstance.addUserData(userDataLoadBalancer);
    webServerInstanceOne.addUserData(userDataWordpress);
    webServerInstanceTwo.addUserData(userDataWordpress);
  }
}