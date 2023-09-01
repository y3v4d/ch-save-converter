import { createSignal, type Component, Show } from 'solid-js';

import styles from './App.module.scss';
import Save, { SavePlatform } from './shared/SaveUtils';

const App: Component = () => {
    const [save, setSave] = createSignal<Save | null>(null);
    const [convertedSave, setConvertedSave] = createSignal<Save | null>(null);

    const onSaveInput = (event: Event) => {
        const target = event.target as HTMLTextAreaElement;
        const save = target.value;

        try {
            const parsed = new Save(save);
            const targetPlatform = parsed.data.platform === SavePlatform.PC ? SavePlatform.MOBILE : SavePlatform.PC;

            const converted = parsed.clone();
            converted.data.platform = targetPlatform;
            converted.data.saveOrigin = targetPlatform;

            if(targetPlatform === SavePlatform.PC) {
                converted.data.rubies = Math.floor(converted.data.rubies / 10);
            } else {
                converted.data.rubies = converted.data.rubies * 10;
            }

            setSave(parsed);
            setConvertedSave(converted);
        } catch(error) {
            console.log(error);

            setSave(null);
            setConvertedSave(null);
        }
    }

    return (
        <div class={styles.App}>
            <header class={styles.header}>
                <h1>Borbot Save Converter</h1>
                <img class={styles.logo} src="favicon.ico" title="HAIL BORB!"></img>
            </header>
            
            <div class={styles.container}>
                <div class={styles.input}>
                    <header class={styles.input_header}>
                        <h2>INPUT</h2>
                    </header>
                    <input class={styles.input_input} type="text" placeholder="Paste your savefile here..." onInput={onSaveInput}></input>
                    <Show when={save() !== null}>
                        <div class={styles.settings}>
                            <p class={styles.settings_p}>Current Save Format: {save()?.data.platform.toUpperCase()}</p>
                            <p class={styles.settings_p}>Converted to: {convertedSave()?.data.platform.toUpperCase()}</p>
                            <p class={styles.settings_p}>Rubies before convertion: {save()?.data.rubies}</p>
                            <p class={styles.settings_p}>Rubies after convertion: {convertedSave()?.data.rubies}</p>
                        </div>
                    </Show>
                </div>

                <Show when={convertedSave() !== null}>
                    <div class={styles.input}>
                        <header class={styles.output_header}>
                            <h2>OUTPUT</h2>
                        </header>
                        <textarea class={styles.textarea}>{convertedSave()?.encode()}</textarea>
                    </div>
                </Show>
            </div>
        </div>
    );
};

export default App;
