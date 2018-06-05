import React, { Component } from 'react';

class StagingForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            namespace: '',
            flavor: 'small',
            hubTimeout: '2',
            dockerRegistry: 'docker.io',
            dockerRepo: 'blackducksoftware',
            hubVersion: '4.6.1',
            status: 'pending',
            token: ''
        };

        this.handleTextChange = this.handleTextChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleTextChange(event) {
        const stateKey = event.target.name;
        this.setState({ [stateKey]: event.target.value });
    }

    async handleSubmit(event) {
        event.preventDefault();
        const { token, ...formData } = this.state;
        const response = await fetch('/api/customers', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'rgb-token': token
            },
            mode: 'same-origin',
            body: JSON.stringify(formData),
        });
        if (response.status === 200) {
            console.log('w00t');
            this.props.addCustomer(formData);
        }
    }

    render() {
        const radioButtons = this.props.kubeSizes.map((size, index) => {
            return (
                <div className="size-radio" key={index}>
                    <input
                        type="radio"
                        name="flavor"
                        id={`size-${size}`}
                        value={size}
                        checked={this.state.flavor === size}
                        onChange={this.handleTextChange}
                    />
                    <label>
                        {size}
                    </label>
                </div>
            );
        });

        const expirationOptions = this.props.expirationHours.map((hour, index) => {
            return <option key={`expiration-${hour}`} value={hour}>{hour}</option>;
        });

        return (
            <div className="form-container">
                <form className="staging-form" onSubmit={this.handleSubmit}>
                    <div className="input-container">
                        <label>
                            Namespace:
                        </label>
                        <input
                            type="text"
                            name="namespace"
                            className="input-text"
                            value={this.state.namespace}
                            onChange={this.handleTextChange}
                        />
                    </div>
                    <div className="input-container" id="size-container">
                        <label>
                            Size:
                        </label>
                        {radioButtons}
                    </div>
                    <div className="input-container">
                        <label>
                            Expiration (hours):
                            <select name="expiration" id="expiration-input" onChange={this.handleTextChange}>
                                {expirationOptions}
                            </select>
                        </label>
                    </div>
                    <div className="input-container">
                        <label>
                            Docker Registry:
                            <input
                                type="text"
                                name="dockerRegistry"
                                className="input-text"
                                value={this.state.dockerRegistry}
                                onChange={this.handleTextChange}
                            />
                        </label>
                    </div>
                    <div className="input-container">
                        <label>
                            Docker Repo:
                            <input
                                type="text"
                                name="dockerRepo"
                                className="input-text"
                                value={this.state.dockerRepo}
                                onChange={this.handleTextChange}
                            />
                        </label>
                    </div>
                    <div className="input-container">
                        <label>
                            Hub Version:
                            <input
                                type="text"
                                name="hubVersion"
                                className="input-text"
                                value={this.state.hubVersion}
                                onChange={this.handleTextChange}
                            />
                        </label>
                    </div>
                    <div className="input-container">
                        <label>
                            Token:
                            <input
                                type="text"
                                name="token"
                                className="input-text"
                                value={this.state.token}
                                onChange={this.handleTextChange}
                            />
                        </label>
                    </div>
                    <div className="input-container" id="submit-container">
                        <input type="submit" value="Submit" />
                    </div>
                </form>
            </div>
        );
    }
}

export default StagingForm;
