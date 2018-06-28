import React, { Component } from 'react';
import bdsLogo from './icon.ico';
import './App.css';
import StagingForm from './StagingForm';
import InstanceTable from './InstanceTable';
import ToastMsg from './ToastMsg';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            kubeSizes: [
                'small',
                'medium',
                'large',
                'OpsSight'
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
            instances: {},
            dbInstances: [],
            invalidNamespace: false,
            toastMsgOpen: false,
            toastMsgText: '',
            toastMsgVariant: 'success'
        };

        this.fetchInstances = this.fetchInstances.bind(this);
        this.addInstance = this.addInstance.bind(this);
        this.setNamespaceStatus = this.setNamespaceStatus.bind(this);
        this.fetchDatabases = this.fetchDatabases.bind(this);
        this.setToastStatus = this.setToastStatus.bind(this);
        this.handleToastMsgClick = this.handleToastMsgClick.bind(this);
    }

    componentDidMount() {
        this.pollInstances = setInterval(() => {
            return this.fetchInstances();
        }, 60000);
        this.fetchInstances();
        this.fetchDatabases();
    }

    componentWillUnmount() {
        clearInterval(this.pollInstances);
    }

    async fetchInstances() {
        const response = await fetch('/api/instances', {
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'rgb-token': 'RGB'
            },
            accept: 'application/json',
            mode: 'same-origin',
        });
        if (response.status === 200) {
            console.log('Customer data fetched');
            const { instances } = await response.json();
            this.setState({
                instances
            });
        }
    }

    async fetchDatabases() {
        const response = await fetch('/api/sql-instances', {
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'rgb-token': 'RGB'
            },
            accept: 'application/json',
            mode: 'same-origin',
        });
        if (response.status === 200) {
            console.log('DB Instances fetched');
            const dbInstances = await response.json();
            this.setState({
                dbInstances
            })
        }
    }

    addInstance(instance) {
        this.setState({
            instances: {
                ...this.state.instances,
                [instance.namespace] : {
                    ...instance
                }
            }
        });
    }

    setNamespaceStatus(invalidNamespace) {
        if (this.state.invalidNamespace !== invalidNamespace) {
            this.setState({ invalidNamespace });
        }
    }

    setToastStatus({ toastMsgOpen, toastMsgVariant, toastMsgText }) {
        this.setState({
            toastMsgOpen,
            toastMsgVariant,
            toastMsgText
        })
    }

    handleToastMsgClick(event, reason) {
        if (reason === 'clickaway') {
            return;
        }

        this.setState({ toastMsgOpen: false });
    };

    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <img src={bdsLogo} className="App-logo" alt="logo" />
                    <h1 className="App-title">Hub SaaS Staging</h1>
                </header>
                <StagingForm
                    kubeSizes={this.state.kubeSizes}
                    expirationHours={this.state.expirationHours}
                    addInstance={this.addInstance}
                    setNamespaceStatus={this.setNamespaceStatus}
                    invalidNamespace={this.state.invalidNamespace}
                    dbInstances={this.state.dbInstances}
                    setToastStatus={this.setToastStatus}
                />
                <div className='paper-container'>
                    <InstanceTable instances={this.state.instances} />
                </div>
                <ToastMsg
                    message={this.state.toastMsgText}
                    variant={this.state.toastMsgVariant}
                    toastMsgOpen={this.state.toastMsgOpen}
                    onClose={this.handleToastMsgClick}
                />
            </div>
        );
    }
}

export default App;
