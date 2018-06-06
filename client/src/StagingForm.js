import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
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
});

const initialState = {
    namespace: '',
    flavor: 'small',
    hubTimeout: '2',
    dockerRegistry: 'docker.io',
    dockerRepo: 'blackducksoftware',
    hubVersion: '4.6.1',
    status: 'pending',
    token: ''
};

class StagingForm extends Component {
    constructor(props) {
        super(props);
        this.state = initialState;

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.resetForm = this.resetForm.bind(this);
    }

    handleChange(event) {
        const stateKey = event.target.name;
        this.setState({ [stateKey]: event.target.value });
    }

    resetForm() {
        this.setState(initialState);
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
            console.log('/api/customers - POST success');
            this.props.addCustomer(formData);
            this.resetForm()
        }
    }

    render() {
        const { classes } = this.props;
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
                                {this.props.kubeSizes.map((size) => {
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
                        id="hubTimeout"
                        name="hubTimeout"
                        select
                        label="Expiration (hrs)"
                        className={classes.textField}
                        value={this.state.hubTimeout}
                        onChange={this.handleChange}
                        SelectProps={{
                            MenuProps: {
                                className: classes.menu,
                            },
                        }}
                        helperText="Please select desired length of HUB instance"
                        margin="normal"
                    >
                        {this.props.expirationHours.map((hour) => {
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
                    >
                        Submit
                    </Button>
                </form>
            </div>
        );
    }
}

export default withStyles(styles)(StagingForm);
