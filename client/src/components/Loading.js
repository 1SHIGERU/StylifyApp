import React from 'react';

const Loading = () => {

  return (
    <>
        <div class="fixed top-0 right-0 h-screen w-screen z-50 flex justify-center items-center">
            <div class="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-orange-700"></div>
        </div>
    </>
    );
};

export default Loading;