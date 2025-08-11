import { Stack } from 'expo-router'

export default function CompanyLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen 
        name="[ticker]/index" 
        options={{ 
          title: 'Company Overview',
          headerBackTitle: 'Back'
        }} 
      />
      <Stack.Screen 
        name="[ticker]/filings" 
        options={{ 
          title: 'Filings',
          headerBackTitle: 'Back'
        }} 
      />
      <Stack.Screen 
        name="[ticker]/filing/[filingId]" 
        options={{ 
          title: 'Filing Details',
          headerBackTitle: 'Back'
        }} 
      />
    </Stack>
  )
}