import { adminPageContainer } from "../../higher-order-components/AdminPageContainer"

const Contents = () => {
  return (
    <div>This is the smart locks page</div>
  )
}

const SmartLocksPage = adminPageContainer(<Contents />, 'Smart Locks')

export { SmartLocksPage }