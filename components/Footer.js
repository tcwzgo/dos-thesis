import { useTranslation } from "react-i18next";

const Footer = () => {
    const { t } = useTranslation();
    return ( 
        <footer className="o-footer -minimal" style={{top: '95%'}}>
            <hr className="a-divider" />
            <div className="e-container" style={{padding: '5px'}}>
                <div className="o-footer__bottom">
                <ul className="o-footer__links">
                    <li>
                    <div>
                        Build number: {process.env.REACT_APP_BUILD_NUMBER}
                    </div>
                    </li>
                    <li>
                    <div>
                        Build date: {process.env.REACT_APP_BUILD_DATE}
                    </div>
                    </li>
                    <li>
                    <div>
                        Commit: {process.env.REACT_APP_COMMIT_ID}
                    </div>
                    </li>
                </ul>
                <hr className="a-divider" />
                <div className="o-footer__copyright">
                    <i
                    className="a-icon boschicon-bosch-ic-copyright-frame"
                    title="Lorem Ipsum"
                    ></i>
                    2023 {t("footer_copyright")}
                </div>
                </div>
            </div>
        </footer>
     );
}
 
export default Footer;