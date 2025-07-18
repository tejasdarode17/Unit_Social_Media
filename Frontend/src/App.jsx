import './App.css'
import '../src/Animations/loaders.css'
import { createBrowserRouter, Outlet } from 'react-router-dom'
import { lazy , Suspense} from 'react'

import { MainShimmer } from './Animations/MainShimmer'
import Login from './Components/Authentication/Login'
import SignUP from './Components/Authentication/SignUP'
import Nav from './Components/Nav'

import Verification from './Components/Authentication/Verification'
import VerificationShimmer from './Components/Authentication/VerificationShimmer'
import ErrorPage from './Errror'

const Body = lazy(()=> import("./Components/Body"))
const Search = lazy(()=> import("./Components/Search"))
const SearchedUserProfile = lazy(()=> import("./Components/UserProfiles/SearchedUserProfile"))
const EditProfile = lazy(()=> import("./Components/UserProfiles/EditProfile"))



const AuthLayout = () => {
  return (
    <Outlet></Outlet>
  )
}


function App() {
  return (
    <>
      <Nav></Nav>
      <Outlet></Outlet>
    </>
  )
}


const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <AuthLayout></AuthLayout>,
    children: [
      {
        path: "/",
        element: <Login></Login>
      },
      {
        path: "/signup",
        element: <SignUP></SignUP>
      },
      {
        path: "/verify-email/:token",
        element: <Verification />
      },
      {
        path: "/verify",
        element: <VerificationShimmer></VerificationShimmer>
      }
    ]
  },
  {
    element: <App></App>,
    children: [
      {
        path: "/home",
        element: <Suspense fallback={<MainShimmer></MainShimmer>}> <Body></Body> </Suspense>
      },
      {
        path: "/profile/:id",
        element: <Suspense fallback={<MainShimmer></MainShimmer>}> <SearchedUserProfile></SearchedUserProfile> </Suspense>
      },
      {
        path: "/profile/edit/:id",
        element: <Suspense fallback={<MainShimmer></MainShimmer>}> <EditProfile></EditProfile> </Suspense>
      },
      {
        path: "/search",
        element: <Suspense fallback={<MainShimmer></MainShimmer>}> <Search></Search> </Suspense>
      }
    ]
  },
  {
    path: "*",
    element: <ErrorPage/> 
  }
])



export default appRouter




