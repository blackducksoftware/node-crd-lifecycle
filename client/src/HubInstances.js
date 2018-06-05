import React from 'react';
import HubInstance from './HubInstance';

const HubInstances = ({ customers, removeCustomer }) => {
    const namespaces = Object.keys(customers);
    if (!namespaces.length) {
        return(
            <div>
                No current HUB instances
            </div>
        );
    }

    return (
        <ul>
            {namespaces.map((namespace) => {
                return <HubInstance key={namespace} customer={customers[namespace]} />
            })}
        </ul>
    );
}

export default HubInstances;
