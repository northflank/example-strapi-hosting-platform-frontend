<h1>
Strapi.run Next.js Site 
</h1>

<img alt="Preview" align="center" src="/preview.png"  />

This site is a management control plane for Strapi.run deployments. 

It connects to a backend server running on Northflank that fetches data about your deployments in real-time. 

You can create a new Strapi deployment by choosing a name of the project. This name will also be used to provision a custom subdomain that will be created on the strapi.run domain. 

**By default, creating a new deployment makes an API call to the backend that then handles:**

- Creating a new project inside a Strapi Hoster team on Northflank
- Creating a combined service from an empty sample Strapi GitHub repository
- Creating a PostgreSQL database for storing configuration data
- Creating a MinIO addon to handle file uploads
- Creating a manual job from a GitHub repository that is later used for configuring default MinIO settings
- Once MinIO has finished provisioning, the job creates a default bucket called 'media' and sets the correct S3 policy

When you create a new deployment, a page appears that informs you about the health of your service, PostgreSQL database and MinIO addon. 

Creation steps are displayed with the corresponding status. This data is re-fetched from the backend every 2 seconds. 

Connection details tab displays information about your resources and their relevant endpoints and access details.

Backup and restore can be used to control creating and restoring backups of your PostgreSQL configurations. 

Opening the Deployments page fetches health of all your previously created resources and displays an overall health status.

Logs and Metrics page currently displays sample fake data. 

Once everything has finished creating and if successful, your Strapi deployment will run on a custom domain displayed at the top of the page. You can visit this link to start configuring your Strapi instance.

See the Readme file of the backend service for more information.

*Created with Elastic UI and Victory Charts components.*
