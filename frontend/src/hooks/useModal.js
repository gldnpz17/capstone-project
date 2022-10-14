import { useCallback, useState } from "react"
import "./Modal.css"

const useModal = (Content) => {
    const [isOpen, setIsOpen] = useState(false)
    const [modalArgs, setModalArgs] = useState({})

    const open = (args) => () => {
        setIsOpen(true)
        setModalArgs(args)
    }
    const close = () => {
        setIsOpen(false)
        setModalArgs({})
    }

    const Modal = useCallback(() => (
        <>
            {isOpen && (
                <div className="modal">
                    <div className="overlay">
                        <div className="modal-content">
                            <Content {...modalArgs} />
                            <div>
                                <button className="btn-cancel" onClick={close} style={{ textTransform: 'none'}}><p>Close</p></button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    ), [Content, isOpen])

    return [Modal, open]
}

export { useModal }