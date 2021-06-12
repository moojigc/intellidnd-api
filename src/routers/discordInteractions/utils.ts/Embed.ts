const _colors = {
    WHITE: 16777215,
    BLURPLE: 7506394,
    GREYPLE: 10070709,
    DARK_BUT_NOT_BLACK: 2895667,
    NOT_QUITE_BLACK: 2303786
};

export type EmbedColors = typeof _colors;

export abstract class EmbedProperties {
    title?: string;
    type?: 'rich' | 'image' | 'video' | 'gifv' | 'article' | 'link';
    description?: string;
    url?: string;
    /**
     * ISO timestamp
     */
    timestamp?: string;
    color?: number;
    footer?: {
        text: string;
        icon_url?: string;
        proxy_icon_url?: string;
    };
    image?: Partial<{
        url: string;
        proxy_url: string;
        height: number;
        width: number;
    }>;
    fields: Array<{
        name: string;
        value: string;
        inline?: boolean;
    }>;
};

export default class Embed extends EmbedProperties {

    constructor(options: EmbedProperties) {

        super();

        for (const k in options) {

            this[k] = options[k];
        }
    }

    setFields(fields: Embed['fields']) {

        this.fields = fields;

        return this;
    }

    setColor(color: keyof EmbedColors) {

        this.color = _colors[color];

        return this;
    }

    toJSON() {

        const ret = {} as Omit<Embed, 'setFields'>;

        for (const k in this) {

            if (typeof this[k] !== 'function') {

                // @ts-ignore
                ret[k] = this[k];
            }
        }
        
        return ret;
    }
}
