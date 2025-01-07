import { useThemeContextStore } from "../../contexts/theme/theme";
import { useModalContextStore } from "../../contexts/overlays/ModalContextProvider"

export const LoaderModal = () => {
    const {loader} = useModalContextStore();
    const {themeCssClass} = useThemeContextStore()
    return (
       
                
        <div className={`comonent-modal ${themeCssClass}`}>
        <div className="modal-content">
            <div className="row">
                <div className="col-12">
                    <p className="text-center">
                        <span className="fs-1 fa fa-spinner font-weight-bolder"></span>
                        <span className="fs-6">{loader.loaderText}</span>
                    </p>
                </div>
                
            </div>
        </div>
    </div>
    )
}