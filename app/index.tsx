import { Redirect } from 'expo-router';


  // TEMP: hardcoded role for Day 2
  type Role = 'USER' | 'PUJARI';
  
  function getRole(): Role {
  // TEMP mock — later comes from auth / storage
  return 'PUJARI';
}

export default function Index() {
  const role = getRole();

  if (role === 'USER') {
    return <Redirect href="/(User)/home" />;
  }

  return <Redirect href="/(Pujari)/dashboard" />;
}
