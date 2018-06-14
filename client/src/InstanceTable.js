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
    width: '90%'
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
                        <TableCell numeric>Expiration</TableCell>
                        <TableCell>Hub Version</TableCell>
                        <TableCell>Database</TableCell>
                        <TableCell>IP Address</TableCell>
                        <TableCell numeric>Container Restarts</TableCell>
                        <TableCell numeric>Failed Pods</TableCell>
                        <TableCell numeric>Critical Events</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {namespaces.map((namespace) => {
                        const customer = customers[namespace];
                        const ip = customer.ip ? customer.ip : customer.status
                        return (
                            <TableRow key={namespace}>
                                <TableCell>{customer.namespace}</TableCell>
                                <TableCell>{customer.flavor}</TableCell>
                                <TableCell numeric>{customer.hubTimeout}</TableCell>
                                <TableCell>{customer.hubVersion}</TableCell>
                                <TableCell>{customer.dbPrototype}</TableCell>
                                <TableCell>{ip}</TableCell>
                                <TableCell numeric>{customer.totalContainerRestartCount}</TableCell>
                                <TableCell numeric>{customer.podsNotRunningCount}</TableCell>
                                <TableCell numeric>{customer.badEventsCount}</TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </Paper>
    )
}

export default withStyles(styles)(InstanceTable);
