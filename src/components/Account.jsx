import React from "react";
import { useState, useEffect } from "react";

const Account = ({user}) => {


  return <div>Account {user.email}  {user.isEmailConfirmed}</div>;
};

export default Account;