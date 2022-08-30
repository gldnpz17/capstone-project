import { adminPageContainer } from "../../higher-order-components/AdminPageContainer"

const Contents = () => {
  return (
    <div>This is the accounts page</div>
  )
}

const AccountsPage = adminPageContainer(<Contents />, 'Accounts')

export { AccountsPage }