import Login from "./components/Login"
import MessengerApp from "./components/MessangerApp"
import {BrowserRouter,Routes, Route} from 'react-router-dom'

function App() {
 

  return (
  <>
<BrowserRouter>
<Routes>
<Route path={"/"} element={<Login/>}/>
<Route path={"/Dashboard"} element={<MessengerApp/>}></Route>
</Routes>
</BrowserRouter>
</>
  )
}

export default App
