import { UserContext } from './App';
import { useContext } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Divider, DialogContentText, Grid, Typography, Switch, Button } from '@mui/material'
import { roles } from './components/utils';
import { useTranslation } from 'react-i18next';
 
const RoleSelector = ({ setRoles, open = false, setOpen, isSuperuser = false }) => {
    const { loggedUserIdmRole } = useContext(UserContext)
    const { t } = useTranslation()
    
    return ( 
        <Dialog open={open} onClose={() => setOpen(false)} keepMounted={false}>
        <DialogTitle>{t("my_roles")}</DialogTitle>
        <Divider />
        <DialogContent>
          {isSuperuser &&
            <DialogContentText>
              <Grid container spacing={2}>
                {Object.keys(roles).map((role) => {
                  return <><Grid item xs={8}>
                    <Typography>{t(role)}</Typography>
                  </Grid>
                    <Grid item xs={4}>
                      <Switch onChange={
                        (e) => {
                          if (e.target.checked) {
                            setRoles([...loggedUserIdmRole, role])
                          } else {
                            setRoles((prev) => prev.filter((r) => r !== role))
                          }
                        }
                      }
                        checked={loggedUserIdmRole.includes(role)}
                      />
                    </Grid>
                  </>
                })}
              </Grid>
            </DialogContentText>
          }
          {!isSuperuser &&
            <DialogContentText>
              {loggedUserIdmRole.map((key) => {
                return <Typography>{key}</Typography>
              })}
            </DialogContentText>
          }
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="primary">
            {t("close")}
          </Button>
        </DialogActions>
      </Dialog>

     );
}
 
export default RoleSelector;