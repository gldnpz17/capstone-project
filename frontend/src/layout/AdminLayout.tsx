import { Outlet } from "react-router-dom"

const AdminLayout = () => {
  return (
    <div>
      <div>Admin Layout Here</div>
      <Outlet />
    </div>
  )
}

export { AdminLayout }