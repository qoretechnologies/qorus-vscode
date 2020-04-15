import React, { useState } from 'react';

export interface IFieldEnhancerProps {
    children: any;
}

const FieldEnhancer: React.FC<IFieldEnhancerProps> = ({ children }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    return <>{children}</>;
};

export default FieldEnhancer;
