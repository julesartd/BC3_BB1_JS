import { useState } from 'react';
import VehiculeForm from '../VehiculeForm/VehiculeForm';
import VehiculesList from '../VehiculesList/VehiculesList';
import './VehiculePage.css';
import Header from '../Header';

const VehiculePage = () => {
  const [refresh, setRefresh] = useState(false);
  const [editVehicule, setEditVehicule] = useState(null);

  const handleSuccess = () => {
    setRefresh(r => !r);
    setEditVehicule(null); // reset form
  };
  

  return (
    <>
    {/* <Header /> */}
     <div className="vehicule-page-container">
      <h2>{editVehicule ? 'Modifier le véhicule' : 'Ajouter un véhicule'}</h2>
      <VehiculeForm
        mode={editVehicule ? 'edit' : 'new'}
        initialData={editVehicule || {}}
        onSuccess={handleSuccess}
      />
      <VehiculesList key={refresh} onEdit={setEditVehicule} />
    </div>
    </>
   
  );
};

export default VehiculePage;