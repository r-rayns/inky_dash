import React from 'react';
import { Field, Form, Formik } from 'formik';
import FormContainer from '../../../components/form-container/form-container';
import { useStateWithLocalStorage } from '../../../hooks/localstorage.hook';
import { Border, Palette } from '../../../services/display/display.enum';
import { toBase64 } from '../../../globals/utils/helpers';
import { setPreview } from '../../../services/display/display.actions';
import { Dispatch } from 'redux';
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from 'yup';
import { RootState } from '../../../redux/reducers';

export default function DisplaySettingsForm(props: { onSubmit: Function }) {
  const dispatch: Dispatch = useDispatch();
  const [ palette_colour, setColourPalette ] = useStateWithLocalStorage('colourPalette')
  const [ border_colour, setBorderColour ] = useStateWithLocalStorage('borderColour')
  const uploading: boolean = useSelector((state: RootState) => {
    return state.displaySlice.uploading
  });

  const displaySettingsSchema = Yup.object().shape({
    upload_field: Yup.string()
      .required()
      .label('Image upload'),
    palette_colour: Yup.string()
      .required()
      .label('Palette colour'),
    border_colour: Yup.string()
      .required()
      .label('Border colour')
  })

  React.useEffect(() => {
    return function cleanup() {
      setPreview(dispatch, null)
    }
  }, [ dispatch ]);

  return (
    <FormContainer>
      <Formik
        initialValues={ {
          upload_field: '',
          attachment_data: new File([], 'empty'),
          palette_colour,
          border_colour
        } }
        validationSchema={ displaySettingsSchema }
        onSubmit={ async (values: DisplaySettingsFormData, { setSubmitting }) => {
          // save palette and border colour values to local storage
          setColourPalette(values.palette_colour);
          setBorderColour(values.border_colour);
          props.onSubmit(values);
          setSubmitting(false);
        } }
      >
        { ({
             isSubmitting,
             setFieldValue,
             handleChange,
             errors,
             touched,
             dirty,
             isValid
           }) => (
          <Form>
            <label htmlFor="upload_field">Image upload:</label>
            <Field type='file' name='upload_field' onChange={ (event: any) => {
              const imageFile: File = event.currentTarget.files[ 0 ];
              setFieldValue('attachment_data', imageFile);
              handleChange(event);
              imageFile && toBase64(imageFile)
                .then(base64 => setPreview(dispatch, base64))
            } }/>
            { errors.upload_field && touched.upload_field ? (
              <div className='validation-error'>{ errors.upload_field }</div>
            ) : null }

            <label htmlFor='palette_colour'>Inky colour palette:</label>
            <Field as='select' name='palette_colour'>
              <option disabled={ true }/>
              <option value={ Palette.RED }>Red</option>
              <option value={ Palette.YELLOW }>Yellow</option>
            </Field>
            { errors.palette_colour && touched.palette_colour ? (
              <div className='validation-error'>{ errors.palette_colour }</div>
            ) : null }

            <label htmlFor='border_colour'>Display border colour:</label>
            <Field as='select' name='border_colour'>
              <option disabled={ true }/>
              <option value={ Border.WHITE }>White</option>
              <option value={ Border.BLACK }>Black</option>
            </Field>
            { errors.border_colour && touched.border_colour ? (
              <div className='validation-error'>{ errors.border_colour }</div>
            ) : null }

            <button type="submit" disabled={ !isValid || isSubmitting || !dirty  || uploading}>
              Submit
            </button>
          </Form>
        ) }

      </Formik>
    </FormContainer>
  )
}

export interface DisplaySettingsFormData {
  upload_field: string;
  attachment_data: File;
  palette_colour: Palette;
  border_colour: Border;
}
