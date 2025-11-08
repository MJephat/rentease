import React, { useContext } from 'react';
import { AuthContext } from '../auth/authprovider';
import { AppStack } from '../auth/appStack';
import { AuthStack } from '../auth/authstack';


export const RootNavigator = () => {
  const { user } = useContext(AuthContext);
  return (
      user ? <AppStack /> : <AuthStack />
  );
};
