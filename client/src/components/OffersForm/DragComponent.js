import { CustomDragDrop } from "./CustomContainer";
import { useState } from "react";

export function DragComponent({
  onSubmit
}) 

{
  const [ownerLicense, setOwnerLicense] = useState([]);
  
  function uploadFiles(f) {
    setOwnerLicense([...ownerLicense, ...f]);
  }

  function deleteFile(indexImg) {
    const updatedList = ownerLicense.filter((ele, index) => index !== indexImg);
    setOwnerLicense(updatedList);
  }

  return (
    <>    
        <div className="mt-40 bg-white rounded-lg w-2/3 px-5 pt-3 pb-5">
            <h1 className="text-5xl font-bold text-[#8B4513]">Add an item</h1>
                <div className="pb-[8px] border-b border-[#e0e0e0]"></div>         
                    <CustomDragDrop
                        ownerLicense={ownerLicense}
                        onUpload={uploadFiles}
                        onDelete={deleteFile}
                        count={10}
                        formats={["jpg", "jpeg", "png"]}
                        onSubmit={onSubmit}
                    />
        </div>
    </>
   
  );
}