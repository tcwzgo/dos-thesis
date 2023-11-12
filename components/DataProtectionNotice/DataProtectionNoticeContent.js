import { Stack, Paper, Typography, Divider } from '@mui/material';

const DataProtectionNoticeContent = () => {
    return ( 
        <>
            <Stack flexDirection="row" gap={4}>
                <Paper sx={{ width: '35rem' }} elevation={0}>
                    <Typography align='center' fontWeight={"bold"}>Data protection notice</Typography>
                    <article className='data-prt'>
                            <p>
                                HtvP/MFD1 (hereinafter “We”) welcomes you to our (Document Store) application. We thank you for your interest in the application!
                                The protection of your privacy throughout the course of processing personal data as well as the security of all business data are important concerns to us. 
                            </p>
                            <div>
                                <b>Potentially processed categories of data</b>
                            </div>
                            The following categories of data are processed in specific application:
                            <ul style={{ listStyle: "inside" }}>
                                <li>Name (internal data)</li>
                                <li>NT user (internal data)</li>
                                <li>Company email (internal data)</li>
                                <li>SAP ID (internal data)</li>
                                <li>Company phone number (internal data)</li>
                                <li>Position (internal data)</li>
                                <li>Application CRUD logs (internal data)</li>
                            </ul>
                            <div>
                                <b>Processing purposes and legal bases</b>
                            </div>
                            <ul style={{ listStyle: "inside" }}>
                                <li>directive conformity purpose</li>
                                <li>data lifecycle log management during the use of applications</li>
                                <li>process automatization and process efficiency improvement for internal cost saving purpose</li>
                                <li>internal regulation conformance</li>
                                <li>mutual need</li>
                            </ul>
                            We are not transferring your data to other controllers from other legal entities.
                            <div>
                                <b>Duration of storage; retention periods</b>
                            </div>
                            Processed data limited to store until it required to fulfill regulations or specified purposes in the applications.

                            This data protection notice is supplemented by the general data protection notice of Robert Bosch Kft. about data processing at work in particular with information about rights of the data subjects, external service providers, the data protection officer etc.
                            <div>
                                <b>Password and encryption</b>
                            </div>
                            We are not storing any password in our applications and using secured communication protocols
                            <div>
                                <b>Authentication</b>
                            </div>
                            Based on CD02900
                    </article>
                </Paper>

                <Divider orientation="vertical" flexItem sx={{ border: "1px solid rgba(10, 10, 10, 0.2)" }}/>

                <Paper sx={{ width: '35rem' }} elevation={0}>
                    <Typography align='center' fontWeight={"bold"}>Adatvédelmi ájékoztató</Typography>
                    <article className='data-prt'>
                            <p>
                                HtvP/MFD1 (továbbiakban "Mi") üdözöl a(z) (Document Store) alkalmazásban. Köszönjük az érdeklődésed az alkalmazás iránt!
                                A titoktartás védelmére kiemelt figyelmet fordítunk a személyes adatok és és üzleti titkot jelentő információ feldolgozozása során.
                            </p>
                            <div>
                                <b>A kezelt adatok kategóriái lehetnek</b>
                            </div>
                            Az alábbi adatkategóriák kezelésére kerül sor egyes alkalmazásokban:
                            <ul style={{ listStyle: "inside" }}>
                                <li>Név (belső)</li>
                                <li>NT user (belső)</li>
                                <li>Céges email (belső)</li>
                                <li>SAP szám (belső)</li>
                                <li>Céges telefonszám (belső)</li>
                                <li>Munkakör (belső)</li>
                                <li>CRUD alkalmazástevékenységek (belső)</li>
                            </ul>
                            <div>
                                <b>Adatkezelési célok és azok jogalapjai</b>
                            </div>
                            <ul style={{ listStyle: "inside" }}>
                                <li>kapcsolódó jogszabályi megfelelés céljából</li>
                                <li>alkalmazások használata során célhoz kötött adatéletciklus követés céljából</li>
                                <li>belső gazdasági érdekek okán folyamatautomatizálási és folyamat hatékonysági fejlesztési célból</li>
                                <li>belső szabályzatoknak történő megfelelés okán</li>
                                <li>közös érdek</li>
                            </ul>
                            Nem továbbítjuk adataid más adatkezelőknek.
                            <div>
                                <b>A tárolás időtartama; megőrzési időszakok</b>
                            </div>
                            Az adatkezelés időtartama a szabályozási környezet kielégítése és az alkalmazáshoz meghatározott célok szerint kerül limitálásra.

                            A jelen adatkezelési tájékoztatót – különösen az adatkezeléssel kapcsolatos jogok, az adatvédelmi tisztviselő személye és külső szolgáltaltók igénybevétele tekintetében - kiegészíti a Robert Bosch Kft. munkaviszonnyal kapcsolatos adatkezelésekről szóló általános adatkezelési tájékoztatója.
                            <div>
                                <b>Jelszó és titkosítás</b>
                            </div>
                            Nem tárolunk jelszót valamint titkosított kommunikációs protokollt használunk az alkalmazásaink
                            <div>
                                <b>Authentikáció</b>
                            </div>
                            CD02900 szerint
                    </article>
                </Paper>
            </Stack>
            <div style={{ color: "rgba(10, 10, 10, 0.4)", textAlign: "center", marginTop: "3rem" }}>
                ©HtvP/MFD1
            </div>
        </>
     );
}
 
export default DataProtectionNoticeContent;