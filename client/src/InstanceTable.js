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

const InstanceTable = ({ instances, classes }) => {
    const namespaces = Object.keys(instances);
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
                        const instance = instances[namespace];
                        const ip = instance.ip ? instance.ip : instance.status
                        return (
                            <TableRow key={namespace}>
                                <TableCell>{instance.namespace}</TableCell>
                                <TableCell>{instance.flavor}</TableCell>
                                <TableCell numeric>{instance.hubTimeout}</TableCell>
                                <TableCell>{instance.hubVersion}</TableCell>
                                <TableCell>{instance.dbPrototype}</TableCell>
                                <TableCell>{ip}</TableCell>
                                <TableCell numeric>{instance.totalContainerRestartCount}</TableCell>
                                <TableCell numeric>{instance.podsNotRunningCount}</TableCell>
                                <TableCell numeric>{instance.badEventsCount}</TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </Paper>
    )
}

export default withStyles(styles)(InstanceTable);
