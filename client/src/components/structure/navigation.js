import { About } from "../pages/About"
import { Account } from "../UserDashboard/Account"
import { Home } from "../pages/Home"
import { Login } from "../pages/Login"
import { Contact } from "../pages/Contact"
import { ErrorPage } from "../pages/ErrorPage"
import { Register } from "../pages/Register"
import { AddOffer } from "../pages/AddOffer"
import { Market } from "../pages/Market"
import  Payment  from "../pages/Payment"
import PaymentSucces from "../PaymentSucces"
import { UserPage } from "../pages/UserPage"
import { Chat } from "../pages/Chat"


export const nav = [
     { path:     "/",         name: "Home",        element: <Home />,       isMenu: true,     isPrivate: false  },
     { path:     "/about",    name: "About",       element: <About />,      isMenu: true,     isPrivate: false  },
     { path:     "/login",    name: "Login",       element: <Login />,      isMenu: false,    isPrivate: false  },
     { path:     "/register", name: "Register",    element: <Register />,   isMenu: false,    isPrivate: false  },
     { path:     "/contact",  name: "Contact",     element: <Contact />,    isMenu: true,     isPrivate: false  },
     { path:     "/account",  name: "Account",     element: <Account />,    isMenu: true,     isPrivate: true   },
     { path:     "/*",        name: "404Error",    element: <ErrorPage />,  isMenu: false,    isPrivate: false  },
     { path:     "/addOffer", name: "AddOffer",    element: <AddOffer />,   isMenu: false,    isPrivate: true   },
     { path:     "/market",   name: "Market",      element: <Market />,     isMenu: true,     isPrivate: false  },
     { path:     "/payment",  name: "Payment",     element: <Payment />,    isMenu: false,    isPrivate: true   },
     { path:     "/payment/success",  name: "PaymentSuccess",     element: <PaymentSucces />,    isMenu: false,    isPrivate: true   },
     { path:     "/payment/cancel",  name: "PaymentCancel",     element: <PaymentSucces />,    isMenu: false,    isPrivate: true   },
     { path:     "/user/:id", name: "PaymentError",     element: <UserPage />,    isMenu: false,    isPrivate: false   },
     { path:     "/chat"    , name: "Chat",        element: <Chat />,       isMenu: true,     isPrivate: true   },
]