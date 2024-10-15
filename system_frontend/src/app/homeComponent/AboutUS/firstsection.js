import  { CloseButton } from '@headlessui/react'
import { MyDialog } from './my-dialog'
import { MyButton } from './my-button'


export default function FirstSection(){
    return (
        <MyDialog>
          {/* ... */}
          <CloseButton as={MyButton}>Cancel</CloseButton>
        </MyDialog>
      )
}