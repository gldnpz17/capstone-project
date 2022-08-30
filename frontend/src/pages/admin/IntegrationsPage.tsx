import { adminPageContainer } from "../../higher-order-components/AdminPageContainer"

const Contents = () => {
  return (
    <div>This is the integrations page</div>
  )
}

const IntegrationsPage = adminPageContainer(<Contents />, 'Integrations')

export { IntegrationsPage }