import React from 'react';
import DisplaySettingsForm, { DisplaySettingsFormData } from './components/display-settings-form';
import { Dispatch } from 'redux';
import { useDispatch, useSelector } from 'react-redux';
import Card from '../../components/card-layout/card/card';
import CardLayout from '../../components/card-layout/card-layout';
import { RootState } from '../../redux/reducers';
import DisplayWrapper from '../../components/display-wrapper/display-wrapper';
import { getImage, uploadImage } from '../../services/display/display.actions';
import { toBase64 } from '../../globals/utils/helpers';
import { DisplayState } from '../../services/display/display.interface';

export default function DisplaySettingsPage() {
  const dispatch: Dispatch = useDispatch();
  const imageState: DisplayState = useSelector((state: RootState) => {
    return state.displaySlice;
  })

  React.useEffect(() => {
    async function initialImage() {
      await getImage(dispatch);
    }

    initialImage();
  }, [ dispatch ]);

  async function upload(formData: DisplaySettingsFormData) {
    const image: string = await toBase64(formData.attachment_data);
    await uploadImage(dispatch, {
      image,
      palette_colour: formData.palette_colour,
      border_colour: formData.border_colour
    });
    await getImage(dispatch);
  }

  return (
    <CardLayout>
      <Card>
        <DisplaySettingsForm onSubmit={ upload }/>
      </Card>
      <Card>
        <label>Preview Display:</label>
        <DisplayWrapper>
          { imageState.preview
            ? <img src={ `data:image/png;base64,${ imageState.preview }` }
                   alt='Preview display'/>
            : <p>No image selected</p> }
        </DisplayWrapper>
        <label>Current Display:</label>
        <DisplayWrapper loading={ imageState.uploading }>
          { imageState.image
            ? <img src={ `data:image/png;base64,${ imageState.image }` }
                   alt='Current display'/>
            : <p>No image set</p> }
        </DisplayWrapper>
      </Card>
    </CardLayout>
  )
}
