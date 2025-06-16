import LogoImg from "../../img/svg/logo-LL036-outline.svg"

interface LogoProps {  
    cssClass: string
}

export function NavLogo(props: LogoProps) {
    return <img src={LogoImg.toString()} className={props.cssClass} alt="logo"></img>
}