import Access from './access'
import GUI from 'lil-gui'

export default class  {
    params?: Record<string, unknown>
    constructor() {
        Access.gui = new GUI()
        this.setParams()
    }

    setParams() {
        this.params = {
            '贴图类型': 1
        }
        const passIndicesToToggle: number[] = [1, 2]
        Access.postProcesser!.passes[2].enabled = false
        Access.gui!.add(this.params, '贴图类型',
                        { '原图': -1, '深度贴图': 1, '法线贴图': 2 })
            .onChange((v: number) => {
                passIndicesToToggle.map((num: number) => {
                    Access.postProcesser!.passes[num].enabled = num === v
                })
            })
    }

    dispose() {
        if (Access.gui) Access.gui.destroy()
    }
}
