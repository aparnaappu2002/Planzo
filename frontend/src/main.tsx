import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {store,persistor} from './redux/Store'
import { Provider } from 'react-redux'
import {GoogleOAuthProvider} from '@react-oauth/google'
import { PersistGate } from 'redux-persist/integration/react'
import { QueryClient,QueryClientProvider } from '@tanstack/react-query'
import { ToastContainer } from 'react-toastify'
import StripePaymentGatewayProvider from './components/stripe/StripePayment'
const queryClient=new QueryClient()
const clientId=import.meta.env.VITE_GOOGLE_CLIENT_ID
createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <GoogleOAuthProvider clientId={clientId}>
      <PersistGate loading={null} persistor={persistor}>
      </PersistGate>
      <QueryClientProvider client={queryClient}>
      <ToastContainer/>
      <StripePaymentGatewayProvider>
            <App/>
      </StripePaymentGatewayProvider> 
      </QueryClientProvider>
    </GoogleOAuthProvider>
  </Provider>
)
