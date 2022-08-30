import { adminPageContainer } from "../../higher-order-components/AdminPageContainer"

const Contents = () => {
  return (
    <div>This is the configurations page</div>
  )
}

const ConfigurationsPage = adminPageContainer(<Contents />, 'Configurations')

export { ConfigurationsPage }