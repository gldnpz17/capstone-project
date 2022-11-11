import { useQuery } from "@apollo/client"
import { useNavigate } from "react-router-dom"
import { INSPECT_SELF } from "../queries/Accounts"

const allowSuperAdmin = () => {

}

const authorizePage = (challengePath, rules) => (Page) => {
  return (pageProps) => {
    const navigate = useNavigate()
    const { data, error, loading } = useQuery(INSPECT_SELF)

    if (loading) return <></>

    if (error) {
      navigate(challengePath)
    }

    return (
      <Page {...pageProps} />
    )
  }
}

const authorizeSuperAdminPage = authorizePage("/admin/login")

export { authorizePage, authorizeSuperAdminPage }