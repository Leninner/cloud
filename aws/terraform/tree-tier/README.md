1. Create a main.tf file
2. Create a terraform cloud repository
   1. Get the organization name
   2. CLI login: terraform login and generate a token to login
   rQLX8yo0fEOzDA.atlasv1.Avfhl72BBOzU8YjXiNNldgQK6UzONG0zouXCJC8yU6MMrEQXezZezIZddTLReoD2T28
   3. Set AWS credentials: AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
   4. Set the terraform config
    ```hcl
    terraform {
      cloud {
            organization = "leninner"

            workspaces {
              name = "the workspace name that we want to create in the terraform cloud"
            }
          }
          ...
    }
    ```
   5. Terraform init: This process will create the workspace in the terraform cloud
   6. We have to assign the variables to the workspace within the terraform cloud

