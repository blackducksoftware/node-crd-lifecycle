import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import ToastMsg from './ToastMsg';
// import deepPurple from '@material-ui/core/colors/purple';

const styles = theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    formContainer: {
        margin: '0 auto',
        width: '80%'
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 500,
    },
    menu: {
        width: 200,
    },
    button: {
        margin: theme.spacing.unit,
    },
    rightIcon: {
        marginLeft: theme.spacing.unit,
    },
    formControl: {
        margin: theme.spacing.unit * 3,
    },
    group: {
        margin: `${theme.spacing.unit}px 0`,
        flexDirection: 'row'
    },
    close: {
        width: theme.spacing.unit * 4,
        height: theme.spacing.unit * 4,
    },
});

// TODO: move toast state up into app? decouple form/toast state?
const initialState = {
    namespace: '',
    flavor: 'small',
    hubTimeout: '2',
    dockerRegistry: 'gcr.io',
    dockerRepo: 'gke-verification/blackducksoftware',
    hubVersion: '4.7.0',
    dbPrototype: '',
    status: 'pending',
    token: '',
    toastMsgOpen: false,
    toastMsgText: '',
    toastMsgVariant: 'success'
};

class StagingForm extends Component {
    constructor(props) {
        super(props);
        // TODO: spread initialState + toast msg so toast not overwritten on poll
        this.state = initialState;

        // TODO: React docs - transform pkg, don't need to bind
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.resetForm = this.resetForm.bind(this);
        this.handleToastMsgClick = this.handleToastMsgClick.bind(this);
        this.validateNamespace = this.validateNamespace.bind(this);
    }

    componentDidMount() {
        this.namespaceField.addEventListener('blur', this.validateNamespace);
    }

    componentWillUnmount() {
        this.namespaceField.removeEventListener('blur', this.validateNamespace)
    }

    handleChange(event) {
        const stateKey = event.target.name;
        this.setState({ [stateKey]: event.target.value });
    }

    resetForm() {
        const {
            toastMsgOpen,
            toastMsgText,
            toastMsgVariant,
            ...rest
        } = initialState;
        this.setState(rest);
    }

    handleToastMsgClick(event, reason) {
        if (reason === 'clickaway') {
            return;
        }

        this.setState({ toastMsgOpen: false });
    };

    async handleSubmit(event) {
        event.preventDefault();
        const {
            token,
            toastMsgOpen,
            toastMsgText,
            toastMsgVariant,
            ...formData
        } = this.state;
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
            this.setState({
                toastMsgOpen: true,
                toastMsgVariant: 'success',
                toastMsgText: 'Hub instance submitted! IP address will appear shortly'
            });
            this.props.addInstance(formData);
            this.resetForm()
            return;
        }

        this.setState({
            toastMsgOpen: true,
            toastMsgVariant: 'error',
            toastMsgText: 'Invalid token, check your token and try again'
        });
    }

    validateNamespace(event) {
        const regExp = RegExp(/[A-Z`~,<>;':"/[\]|{}()=_+!@#$%^&*]+/)
        const invalidNamespace = regExp.test(event.target.value);
        this.props.setNamespaceStatus(invalidNamespace);
    }

    render() {
        const {
            classes,
            invalidNamespace,
            kubeSizes,
            expirationHours,
            dbInstances
        } = this.props;
        // const primary = deepPurple[200];

        return (
            <div className={classes.formContainer}>
                <form
                    id="staging-form"
                    className={classes.container}
                    noValidate
                    autoComplete="off"
                >
                    <TextField
                        id="namespace"
                        name="namespace"
                        label="Namespace"
                        className={classes.textField}
                        value={this.state.namespace}
                        onChange={this.handleChange}
                        margin="normal"
                        autoFocus
                        inputRef={el => this.namespaceField = el}
                        error={invalidNamespace}
                        helperText="Lowercase letters, numbers, and hyphens only"
                    />
                    <div className={classes.root}>
                        <FormControl component="fieldset" className={classes.formControl}>
                            <FormLabel component="legend">HUB Size</FormLabel>
                            <RadioGroup
                                aria-label="HUB Size"
                                name="flavor"
                                className={classes.group}
                                value={this.state.flavor}
                                onChange={this.handleChange}
                            >
                                {kubeSizes.map((size) => {
                                    return (
                                        <FormControlLabel
                                            key={`flavor-${size}`}
                                            value={size}
                                            control={<Radio color="primary" />}
                                            label={size}
                                        />
                                    );
                                })}
                            </RadioGroup>
                        </FormControl>
                    </div>
                    <TextField
                        select
                        id="hubTimeout"
                        name="hubTimeout"
                        label="Expiration (hrs)"
                        className={classes.textField}
                        value={this.state.hubTimeout}
                        onChange={this.handleChange}
                        SelectProps={{
                            MenuProps: {
                                className: classes.menu,
                            },
                        }}
                        margin="normal"
                    >
                        {expirationHours.map((hour) => {
                            return (
                                <MenuItem key={`expiration-${hour}`} value={hour}>
                                    {hour}
                                </MenuItem>
                            );
                        })}
                    </TextField>
                    <TextField
                        id="dockerRegistry"
                        name="dockerRegistry"
                        label="Docker Registry"
                        className={classes.textField}
                        value={this.state.dockerRegistry}
                        onChange={this.handleChange}
                        margin="normal"
                    />
                    <TextField
                        id="dockerRepo"
                        name="dockerRepo"
                        label="Docker Repo"
                        className={classes.textField}
                        value={this.state.dockerRepo}
                        onChange={this.handleChange}
                        margin="normal"
                    />
                    <TextField
                        id="hubVersion"
                        name="hubVersion"
                        label="Hub Version"
                        className={classes.textField}
                        value={this.state.hubVersion}
                        onChange={this.handleChange}
                        margin="normal"
                    />
                    <TextField
                        select
                        id="dbPrototype"
                        name="dbPrototype"
                        label="Database"
                        className={classes.textField}
                        value={this.state.dbPrototype}
                        onChange={this.handleChange}
                        SelectProps={{
                            MenuProps: {
                                className: classes.menu,
                            },
                        }}
                        margin="normal"
                    >
                        {dbInstances.map((instance) => {
                            return (
                                <MenuItem key={`instance-${instance}`} value={instance}>
                                    {instance}
                                </MenuItem>
                            );
                        })}
                    </TextField>
                    <TextField
                        id="token"
                        name="token"
                        label="Token"
                        className={classes.textField}
                        value={this.state.token}
                        onChange={this.handleChange}
                        margin="normal"
                    />
                    <Button
                        variant="contained"
                        size="medium"
                        className={classes.button}
                        type='submit'
                        color="primary"
                        onClick={this.handleSubmit}
                        disabled={invalidNamespace}
                    >
                        Submit
                    </Button>
                    <ToastMsg
                        message={this.state.toastMsgText}
                        variant={this.state.toastMsgVariant}
                        toastMsgOpen={this.state.toastMsgOpen}
                        onClose={this.handleToastMsgClick}
                    />
                </form>
            </div>
        );
    }
}

export default withStyles(styles)(StagingForm);

StagingForm.propTypes = {
    addInstance: PropTypes.func,
    dbInstances: PropTypes.arrayOf(PropTypes.string),
    expirationHours: PropTypes.arrayOf(PropTypes.string),
    invalidNamespace: PropTypes.bool,
    kubeSizes: PropTypes.arrayOf(PropTypes.string)
}
