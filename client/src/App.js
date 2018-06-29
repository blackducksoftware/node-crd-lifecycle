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
        this.removeInstance = this.removeInstance.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
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

    //TODO: remove hardcoded tokens
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
                dbInstances : [
                    'empty',
                    ...dbInstances
                ]
            })
        }
    }

    async handleDelete(namespace) {
        const response = await fetch('/api/instances', {
            method: 'DELETE',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'rgb-token': 'RGB'
            },
            mode: 'same-origin',
            body: JSON.stringify({ namespace }),
        });

        if (response.status === 200) {
            this.setToastStatus({
                toastMsgOpen: true,
                toastMsgVariant: 'success',
                toastMsgText: 'Hub instance deleted!'
            });
            this.removeInstance(namespace);
            console.log('Deleted instance');
            return;
        }

        console.log(response.status);
        this.setToastStatus({
            toastMsgOpen: true,
            toastMsgVariant: 'error',
            toastMsgText: 'Hub instance not deleted, check your network settings and try again'
        });
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

    removeInstance(namespace) {
        const { [namespace] : instance, ...rest } = this.state.instances
        this.setState({
            instances: {
                ...rest
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
                    <h1 className="App-title">Welcome to Kipp 2x: Internal SaaS.</h1>
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
                    <InstanceTable instances={this.state.instances} handleDelete={this.handleDelete} />
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
