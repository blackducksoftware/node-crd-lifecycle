import React from 'react';

const HubInstance = ({ customer }) => {
    return (
        <li>
            {customer.namespace}
        </li>
    );
}

export default HubInstance;
