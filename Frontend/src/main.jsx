import { createRoot } from 'react-dom/client'
import appRouter from './App.jsx'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Provider } from 'react-redux'
import store from './utils/Store/store.js'

createRoot(document.getElementById('root')).render(
  <>
    <Provider store={store}>
      <RouterProvider router={appRouter} />
      <Toaster position="bottom-center" reverseOrder={false} />
    </Provider>
  </>
)
