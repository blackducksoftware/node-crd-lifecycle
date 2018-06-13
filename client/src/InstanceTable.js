import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

const styles = theme => ({
  root: {
    marginTop: theme.spacing.unit * 3,
    overflowX: 'auto',
    margin: '0 auto',
    width: '80%'
  },
  table: {
    minWidth: 700,
  },
});

const InstanceTable = ({ customers, removeCustomer, classes }) => {
    const namespaces = Object.keys(customers);
    if (!namespaces.length) {
        return(
            <div>
                No current HUB instances
            </div>
        );
    }

    return (
        <Paper className={classes.root}>
            <Table className={classes.table}>
                <TableHead>
                    <TableRow>
                        <TableCell>Namespace</TableCell>
                        <TableCell>Size</TableCell>
                        <TableCell>Expiration</TableCell>
                        <TableCell>Hub Version</TableCell>
                        <TableCell>Database</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>IP Address</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {namespaces.map((namespace) => {
                        const customer = customers[namespace];
                        return (
                            <TableRow key={namespace}>
                                <TableCell component="th" scope="row">
                                    {customer.namespace}
                                </TableCell>
                                <TableCell>{customer.flavor}</TableCell>
                                <TableCell>{customer.hubTimeout}</TableCell>
                                <TableCell>{customer.hubVersion}</TableCell>
                                <TableCell>{customer.dbPrototype}</TableCell>
                                <TableCell>{customer.status}</TableCell>
                                <TableCell>{customer.ip || '-'}</TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </Paper>
    )
}

export default withStyles(styles)(InstanceTable);
