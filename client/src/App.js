import React, { Component } from 'react';
import bdsLogo from './icon.ico';
import './App.css';
import StagingForm from './StagingForm';
import HubInstances from './HubInstances';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            kubeSizes: [
                'small',
                'medium',
                'large',
                'opsSight'
            ],
            expirationHours: [
                '2',
                '4',
                '8',
                '16',
                '32',
                '64',
                '128',
                'never'
            ],
            customers : {}
        };

        this.fetchCustomers = this.fetchCustomers.bind(this);
        this.addCustomer = this.addCustomer.bind(this);
    }

    componentDidMount() {
        this.fetchCustomers();
    }

    async fetchCustomers() {
        const response = await fetch('/api/customers', {
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'rgb-token': 'RGB'
            },
            accept: 'application/json',
            mode: 'same-origin',
        });
        if (response.status === 200) {
            console.log('w00t');
            const customers = await response.json();
            this.setState({
                customers
            })
        }
    }

    addCustomer(customer) {
        this.setState({
            customers: {
                ...this.state.customers,
                [customer.namespace] : {
                    ...customer
                }
            }
        });
    }

    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <img src={bdsLogo} className="App-logo" alt="logo" />
                    <h1 className="App-title">Kipp Saas Staging</h1>
                </header>
                <StagingForm
                    kubeSizes={this.state.kubeSizes}
                    expirationHours={this.state.expirationHours}
                    addCustomer={this.addCustomer}
                />
                <HubInstances customers={this.state.customers} removeCustomer={this.removeCustomer} />
            </div>
        );
    }
}

export default App;
