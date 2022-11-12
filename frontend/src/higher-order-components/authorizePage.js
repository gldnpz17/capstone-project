import { useQuery } from "@apollo/client"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { INSPECT_SELF } from "../queries/Accounts"

const allowSuperAdmin = (account) => {
  return account.privilegePreset.isSuperAdmin
}

const authorizePage = (challengePath, rules) => (Page) => {
  return (pageProps) => {
    const navigate = useNavigate()
    const { data, error, loading } = useQuery(INSPECT_SELF, { fetchPolicy: 'no-cache' })

    useEffect(() => {
      if (error) navigate(challengePath)
    }, [error, loading])

    useEffect(() => {
      if (data && !rules.every(rule => rule(data.inspectSelf))) navigate(challengePath)
    }, [data])

    if (loading) return <></>

    return (
      <Page {...pageProps} />
    )
  }
}

const authorizeSuperAdminPage = authorizePage("/admin/login", [allowSuperAdmin])

export { authorizePage, authorizeSuperAdminPage }