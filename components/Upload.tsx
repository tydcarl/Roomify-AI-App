import React, { useState } from 'react'

const Upload = () => {
    const [file, newFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [progress, setProgress] = useState(0);
    
  return (
    <div className="upload">Upload test</div>
  )
}

export default Upload