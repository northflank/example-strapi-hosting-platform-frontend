import React from 'react';
import Router from 'next/router';
import {
  EuiButton,
  EuiFieldText,
  EuiForm,
  EuiFormRow,
  EuiSpacer,
  EuiTitle,
} from '@elastic/eui';
import Head from 'next/head';

class InputForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      projectName: '',
      loading: false,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    this.setState({
      loading: false,
    });
    this.setState({
      [name]: value,
    });
  }

  async handleSubmit(event) {
    event.preventDefault();

    await this.setState({
      loading: true,
      publicProjectName: this.state.projectName,
    });

    const response = await triggerStrapi({
      apiKey: this.state.apiKey,
      publicProjectName: this.state.publicProjectName,
      version: this.state.version,
    });

    await Router.push(`deployments/${response?.slug}`);

    this.setState({
      loading: false,
      projectName: '',
    });
  }

  render() {
    return (
      <EuiForm onSubmit={this.handleSubmit} component="form">
        <EuiFormRow label="Name" helpText="Input the name for your deployment.">
          <EuiFieldText
            required
            isInvalid={
              this.state.projectName?.length < 4 ||
              this.state.projectName?.length > 40
            }
            name="projectName"
            value={this.state.projectName}
            pattern="^[a-zA-Z](-?[a-zA-Z0-9]+((-|\s)[a-zA-Z0-9]+)*)?$"
            title={
              'Alphanumeric characters separated by spaces or hyphens, must start with a letter'
            }
            onChange={this.handleChange}
          />
        </EuiFormRow>
        <EuiSpacer />
        <EuiButton type="submit" disabled={this.state.loading} fill>
          {this.state.loading ? 'Provisioning...' : 'Provision Strapi'}
        </EuiButton>
      </EuiForm>
    );
  }
}

export const CreateNewForm = () => {
  return (
    <>
      <Head>
        <title>New deployment</title>
      </Head>
      <EuiTitle size="l">
        <h1>New deployment</h1>
      </EuiTitle>
      <EuiSpacer />
      <InputForm />
    </>
  );
};

const triggerStrapi = async ({
  apiKey,
  projectName,
  publicProjectName,
  customerId,
}) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/strapi/create-deployment`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          projectName,
          publicProjectName,
          customerId,
        }),
      }
    );
    return await response.json();
  } catch (error) {
    console.log(error);
  }
};

export default CreateNewForm;
