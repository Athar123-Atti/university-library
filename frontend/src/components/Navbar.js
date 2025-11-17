import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar({ user, onLogout, theme, setTheme }) {
  const location = useLocation();

  const linkStyle = (path) => ({
    textDecoration: "none",
    color:
      location.pathname === path
        ? theme === "dark"
          ? "#4dabf7"
          : "#007bff"
        : theme === "dark"
        ? "#ccc"
        : "#333",
    fontWeight: 600,
    transition: "color 0.3s ease, transform 0.2s ease",
  });

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 28px",
        background: theme === "dark" ? "#0f1115" : "#ffffff",
        color: theme === "dark" ? "#fff" : "#000",
        boxShadow:
          theme === "dark"
            ? "0 2px 10px rgba(255,255,255,0.05)"
            : "0 2px 10px rgba(0,0,0,0.1)",
        borderBottom: theme === "dark" ? "1px solid #1f1f1f" : "1px solid #e5e5e5",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        transition: "all 0.3s ease",
        backdropFilter: "blur(8px)",
      }}
    >
      {/* Left: Only Logo */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <img
          src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMTEhUTEhMWFhUXFx0YFxgYFh4eGhgdGSEXGBgeGhsbHyggHx4lHRgaITEhJSkrLi4uGB8zODMuNygtLisBCgoKDg0OGxAQGzUmICYtLTctLS0vLy0rLS0tLS0tLS0vLS0tLS0tLSstNy0tLTAtLS0tLS8tLS8vLS0tLS0tLf/AABEIAOAA4QMBIgACEQEDEQH/xAAcAAACAgMBAQAAAAAAAAAAAAAABwUGAwQIAgH/xABMEAACAQIEAgYGBQkFBwMFAAABAgMEEQAFEiEGMQcTIkFRYRQyQnGBkSNSocHRCBUzYnKCorHSQ1OSk+EWFzRUssLwJGPiJXOjs8P/xAAZAQEAAwEBAAAAAAAAAAAAAAAAAwQFAgH/xAAyEQACAgADBgMHBAMBAAAAAAAAAQIDBBExEhMhQVHwIjLRBRQjYYGxwTNxkeFCofEk/9oADAMBAAIRAxEAPwB44MGDABgwYMAGDBgwAYMGDABgxEZhxFDGSurWw2svIHwJ5D3c8QFVxJO5IUaB+rube8j8MVLsdTXwbzfyJoUTkXR3A5kD341HzSIe2D7t/wCWFXmnFtJESZ6lWbvAYs4PuUEg++2K3V9LEC3EUMkh8WYID8rn5jFX3zE2fpV/z2iTc1x80h3y59GLABjy7h3/ABx8/Pg+ofnjnup6X6g/o6eJR+sWb+RUY026WK/uEAv4Rm3yLHDL2g+aX8f2PgI6P/Pw3uhHx/0xkTO0Pst9nu8cc1jpYzDxh/y/wONym6YKofpIIWH6upT/ANR/ljzZ9oLmn/HoM6GdHx5pEfat7wR9vLG1HKrbqQfcb4QVB0xwk/TUzp5owf7Dpxa8p49oJiOrqVRvCQlG8gC2xN/A4e94qv8AUr4fLtjdVS8shq4MVqnzWRe8Mvnv9uJWlzdG2bsnzO3z/HFin2hTZwzyfzI50TiSGDHwHH3F4hDBgwYAMGDBgAwYMGADBgwYAMGDBgAwYMGADBgxVuJeK1ivFDZpOTHuT8W8u77MR22xrjtSOoxcnkiZzbOIqdbubta4Qesfh4eZxSs04mklBLMI4wCSL2AA+s234YpPEfFCUxZ5WZ5m3C37Z8CT3Dz+WF7LV12azCGJGkJ9WKP1QNt2PLbbtMbC/djOe+xWnhj9/X7FjwVfNlwzzpFhiZhTjrm5ajcJ+LWPgAD44qZrszzWTq4xLL/7cSkIoP1rbW25ufjhq8F9B0UYWTMX61+fUoSIx+02zMfdYe/DZpctiii6mKNYo7EBYwFAvsbabWPni5ThKqtFx6kM7ZS1ZzxR9DE6QtUZhUxUsSLqewMrqBzuF7PyLYuvCXRVk01OtTG01Wjg6S7lASpKkWQKw3BG98R3RChEuaZLVEtcudwbtzhla5+sDGw+eJHoAr2jWsy6U/SU0xIF/ElJAPIOl/38WSM1+jGryrMFnjTK6aKaJdSJIBNrXle7rqNmsD+0vjia6Hc4TMaaZ5aWkjaOXSFhhCqFKqRsb9+rvwnsmqpcuzSapjUmOlqWjnA/u2d42BF/La+wbRhhfk/TItTmUMbAx61aO3IqrSrceRBX7MATfR3nP5wqswgqKal6unfSmmAXI1yL2r3B2Qd2NPLYaKpziry2XLKIJEhdJI4gjn9Fs2nmfpDuLchjW6CWvW5ufGVfteox5o6xKfijMpZDZI6QyMfIR0znAGrm3BmRyZkMrihqo59OovC+qNOyXs/WsxA025DmwGIfiHoQljcJTVkMrsCyRSnq5WUc9IuQ1rgE9kb4tnQbl7zyVmbTjt1EjLH5LfVJY/VvpUeHVnFezjKmz/PKmNJTHDSxmNZAt7FDblcXvIXPMXVcAUVmzXKHCuJoBfZWGqJjzNucbe8YunDfS5G1krY+rP8AeR3Kd/rJuw+Gr3DF54M4VzWCdqevqEq6AxttJaTUbgKpEg1DYk2uV2tiq8ddH2UyVZpqSpSlrSocQuT1Llr2XUfUY7HSCdiLLitdhKrfMuPXmSQtnHRjByjOuyrwyLJG3Kx1KeXK3I+WLNQZkku3qt9U/d445Vb85ZLUFHVoifZbeKUC24tsw8wbi9tsNXgzjiGtso+jnHOMnn5xn2h9o8O/Ge44jB8V4ofb0+xYzru14McWDEHlec3skvPub+r8cTmNOi+F0dqBWnW4PJhgwYMTHAYMGDABgwYMAGDBgwAYMGKxxnxAYF6qI/SMNyD6inv957vDn4YjssjXHakdRi5PJGpxhxOUvBAe1ydx7Piqnx8T3e/koOLOKxTAxRkNMefeE7+14t5fPzOMOJvRk0RH6Zx430A82PiT3fP3w/A3By1CyZhmDtHQRHVI5vqna/qIeZuxsWG9zYb3K0aqpYiW9t05Lvtlic1WtmOp94E4Aq82lMzsUg1fSTtuWPesY9pu7wX5AtngnPqKizCTJo6U02nZJXIL1DgarsR9ZTdd+W1hcLia6PuPMvrUWCmtA6Cy07AKQo5aLdlhYd247xiJ6aODWqYVraYEVVMNQKes6KdVgRvqU9pbfrDmRjSKoy8GKf0YcZLmVGHJAnjsk6jubuYD6rAXHnqHdi0RV0TSPEsiNIgBdAwLIGvp1DmL2PPACd45/wDp3EdJXDaKpAWQ32vtDJfyCtG3vGPebn83cUwyjaOuUK3vk+jt/mJGxP6xxculbhaCuowJqhKYxPrWZ7aRsQytcjYjz5gc+RTNJVZTQ1C1E1VUZnURsGXQuiIMltOp5CWexFwRtt8wLNlmTxycRZpRSj6OpgkBHgZOpmDDu1A9oHxxo9CFJJR51U0k2zCGRCO4lHjYEX7ityPI48jpGq6ioNXQZNEZ22M3VSTSWA0bOgW3ZFvcMScedcUOxkShRGPM9Sik93N2ucAbf5PW8uZt4yR/zqD9+Kn0wRy/nuaKC+uqjhiIHNtXVqFv5mNR7tsWFc44piuRRJvz0wxm/v0NfEXU8eV0U61WYZLGZI/VlMEkTi1x67agRubbYAamczJk2TMIyLwQhIzb1pW7IYjzdtR+OFTwVwBmy0keYUFX1UswLGJiV1KC2gknUjk8wGAFm542eK+kCgzmnSnqJJqFlfrL6OuiLAEANos55nfSOffiX4GqM7gkp4opaeuoCyR9ajK6xINjuNMikKOTAgWAwAxuIs//ADdl5qKpg8kcag2GnrZSALADkGa525C57sJXK+C1q8vrM3zSZ42kvJEw8iRcqfWDsVRV22AsdxiW4wlkz/NhQQOVpKXV1kgF11DZ3tcA72Rf3iNicVjhjKM0zVBQx1DPl8EwBkcqAoF9Nge23Z5JcgXHLngBhdEFI+Y5VJFmSmeDrSsJkuWsAL6X9aykkBgbjtC9hYLzpG6M6jLG9Ip2eSmBuJB+khPs9Zp5b8nFhfwJF2T0jcVjLIYMqy1D6Q6Kkdhcxqx0KR9aRmBt53J7r0isOY8PyQSTzrUx1Snr6d3LX5dYCGvvZtpBzNwQRzA3OAekIT6aerIEp2STkJPJvBvDuPv5t3Jc302jk9XkrHu8j5YS3Sx0Y+jA11Ep9GbtSRW3gvvcfqb/ALvu5bXRpxr14FLUMDKP0btzkA7ifrgd/ePPnk4jDyw8t9T9V3y+xbrsVi2J/RnQWDEDw/md7RMbn2T7u4/diexoUXxugpxK84ODyYYMGDExwGDBgwAYMGDAGhnmZrTwtK3dso+sx5D/AM7gcJHifiARJJPKdcjHsjYamPLbwH8hi4ccZr10xQN9HFce9vaP3fDzwjc8q5cwrEihBe7CKFfG5tf4ne/cAPDGbL/03bP+MSyvhQz5skej3hGXN6wmRiIVIeok8jyRf1mtYeABPdY9Oz5HTtSmjMainMfV6BsAtrbeBHMHnffC5ThiheifIYK0R1SaZJtI/SyWDHUD667L2VN10JfkQYbLOOMxyWVaTOI2mgO0c6nU1hYXRzbrANrq1nGoeQxpJZFYqsHBUcVfJldTIYJywehqhsHv6iuNtmtsRYq6kXN7YteR9KNTltQ1BnAEvVkL18bBnUG1i9vXFiD3OO8E7YsvSFk0OdUC1VBIsk0PbhZDZjyLRnvVuRANiGA5XOK10O0OWT0FXJVqJJrn0x5zeyElkZWO6g2JLX1a1JvsuANHOOHKuOs9K4flvT1qsGeJhohN7yBydowPWB2Ze0osQLw+XZ9BlMjCgY1+Yygo892MILkErEoOqZiwHaPM2I7xj0s0uYv+asjiMNCpJkckgy3O8k789O1lTmQBtsArb4V4Hpcnp3mjiepqFjJZwoMr2FysS37IP1Qbna5O2AKBlvRhmeZuKjN6l0B3EZIMgB7gg+jiB22A964vdDwdlGWxdctOJbMF6woZ31FgmwANiDz0gWxa4o5nlim6xo4uqOunaNb620kFnBJBUXGkXBvzxny7L4oFKQxrGpYsQosNTG7H3k4AxipkFQIhAep6rV12pdIfVp6vR619Pa1cu7Gm5rzTSaRTJU6z1Wou0WjUNJe1m1FL8u+3uxM4MAac3pHXx6eq9H0N1t9XWa9tGi3Z08738sarZjPHFUSTUxPVs3VJC3WPNGACpC2FnO/Y8u/EtgwBTs/4YymqaKOqp4knqFLRi3VzNpAZt0sSVB3BJGKBm/RDWUTmoyeqfUP7MtoktztqFkcfqsAPfh3MgJBIBIvY23F+dj3YiJsvmgimNERJNJL1oFTK5QFyusAi5VQoNlAsDgBN5F0iaPSqPMIRR1c6GOSrWHS2oqwVp4xY3Gq+pdu1yA3xNJVNw/kSmMxyz1EraJIzqiu4bRIDbtARxqQPE+F8Xfi7h7L8zZ6Se3pEaBwy7SxK1wpBtYqSD2TcctuRwl80o6rJiaHMI/Sstmba3LxDwsf0cy8yh2O43B1YAm+kaN58locwq5Y1rl0mNozZpUexHq8nUaXJGykMBbVi6cPZJTZpFRZtWwlZ44+1qNo30E6XZTtpvd15etvcAYpWQdHVEqJX1OYrNlkQLxqQRzN9Di+x1bFFF2O1hfHvMc2ruIpjS0INPl6ECRyLBgLW125m3qxA25EnkQBY6rpPaqzCOiy2mFVDqtUOw7Lp6r6b7BBf1m9Y2AG41Lbpa4EbLKhZ6e4ppHvGRzhf1tF/gSp52B71JPQHCnC9LltP1cChRa8kjW1ORzZ28t9uQwpcq4tFZXVmV5hUpU01U5SnmSwWNwfour2sL9kd41qNzqJIEpwFxSK2AMTaeOwkANt/ZcDwNvgQfLDVyav62O59YbMPPx+OOVoGnybMmSQG8baJAOUkZsQR7xZh52v34f8AkWaKrJIrAxuAbjkVaxB+/GO17niM15Jf6/59i4vjV/NF5wYAcGNgphgwYMAGIribMuop3ceseyn7R5fLc/DErihdINWWlSJb2RdR8CW5fID+LFfE2butskqjtSyFfx7m3U02gHty9m9ze3tH5G372MvQxR09HFLnFcdEaMIICVJOptnZQASbA6bju6zwxS+Mal6qu6qMFiGEMa3vdibEDu3Y2+AxeekXKpXlochol1dRD1jeyryFWZmJO3IMb8rykY5wlW7qXV8T26W1Iu3GPRlS5ioraGQQVDgSpIlxHKWs6swG4YnfWu+5JBOFfmEs65lTJxJ1zRQrpHZurqLkNdba1JI1MLsQoB35XXK+lipoWSmzehaLSNKvGunZbAWQnSwHijW8sX+KuyvOYDGHiqEIuUO0id19Js6Hn2hb34tEQuxwDU0sqVvDtUrwykXjZwV0k955Ogubg9tbbXOITietbNa3815WqJAZDJUSRrZJpLjrZnO56tT6oubm3Ps22uMqFMgp56akqJXkrjZFJ/QxDZzYbM7E6A1gbXtuN790acInK8vZ+qMlZInWSJcBiQLpCGOwtyJ+sWPK2AJjKeHxllCYcvhWWVbEh3CGViQGZ3sbbXIFrbWGJqmyqJJpahVtLMEWRtTHUIwQgsTYW1HkBfGLLMvQO1UYeqqJ44+uBbURoBspsSt11EXXn57YksAGDBgwAYMGDABgwYMAGDBgwBr11OzxyLG/VSMhVZAoJQ2OlrHY2JvY4hq6np6lTllXed/R1eQtGVDC+jrAwGhX1C9gbju2xYcauaQSPC6Qy9TIykJJoD6D3HS2x9xwBzrmGWHJ6p6CvDTZbUnUD3ixAWWMj1ZY9gwHMHcEFcN7N+LcsyeljRCoXQGhhhsWdW5Pz5NudbHffmcbHF+SU+a0s9H1qNPCR2hzil06lJHcGBsQO4nvGyy6I46eonFBmcCvU0Wv0frN7AH6SNhyfQ12UG9tTW5YAzLS5vxEQ0h9Dy8kELvZxzBA2Mp5do2TbbcWxb6voZy9oIYo+siaNw7TKQZZNrEFiLDkCLCwI2G5uxgMLHpL6RWicZflv0lbIdBZbERX7t9tfv2XmcAQ3Txw/FPB6XAweajKxVABuwRrFddt9Slgfc7HuxB9EWedZC1K5u0PaTxKE79/st/1LhhdHvAsNJTTR1EwmmrFtU9u6m4YaRfcntt2juScIrLdeV5qY5DbqpTFIeQKE21e6xDj3DFXGU72px58v3JaZ7E0zqLh2r1xaTzTY+72fs2+GJXFP4bqNEwHcw0/HmP/ADzxcMcYC7eUrPVcD2+GzMMGDBi6QhhNcVZh2qiobcDWwvfkt9IHwAGG3mk2iGRhzCMR77G324QPSDOUonFyC7Kn26j9inGdjfHOFfV9/ks0cIykQ3QjlPpWbRu+4hDTtcc2FlT463Vv3cdPlBcGwuORtuL87H4DCY/Jqy60VXUH2nSIeWgF2+fWL8sOnGiVjXr6CKdDHNGkiHmrqGU/A7YWmedC1I0gmo5pKNlYMdJLKAOZQkhkNu/UQPDDTxT+lvNzTZVUupszr1S72N5ToNj4hSx+GAFnwTD+ec+lrHu1PTWMYa52W604N97mxkPmD44cMbxVNSJI55g1G7xSRqWWJmdVNpFItJpBBUg2BOKh0HZM0GU9YoHW1BeUauW3YiBtvp7Or984vuXtL1SekdWJtI6zq76NVu1p1b2v445nLZQNy+DGlPmkCevNGvvcD78RFbxxRxmwcyH9QXHzNhjjexy4s62W9EWTBioR9INOf7OT+H8cbMPGcTco2+JGPHiK1zOt1LoWbBiKp8+jbuI+WNxK1D348WJqf+R465LkbODGo+YIO/EfWcRKns3+OPHiqlzPVVJ8ibwYptTxvp5RD/F/piPl6R2H9gv+M/hgsVW+Z7uZ9BhY+E4XP+9G3On+Un/xx6HSpH307fBx+GOt/HkebuRdqkTCSMwpFoZz6QzEh9IUhSlhu1wo37h8k7005e9BmFLm9OLEuBJ3Aug2v+3HdT+wfHFxTjykrP8A0skcqLP9ESGAtr7PrKQRueeM3GtHFmGTVCQhz1St1etWD66Ym47e5voK379Rx3CW0jhprUrWcZLnWaykx1iwZc+l4WQ6S8bqGF1Q62IDWIdgLgkYzQdAdCFAeoqWe25UxqpPkpRiPmcSHQDm5mywRMe1TyNHz30taRf+or+7hlY7PBV0vQZRRukkdTVq6MGVtUdwykEH9H3EYpH5RWTiKuiqFFhURWbzeKyk/wCBox8MdF4Vv5Q+XdZlqSgbwzqSf1XDIf4inywBr8F5o01JTzXu2gX/AGo+yftW/wAcNiJ9QDDkQD88c+9ENXqpJI+ZSU28g4BH2hsPPh+XVTofAW+RIxlYP4eIsr+vf8lq7xVxkSODBgxqlUiuKZLU0nnYfMjCC6XJR1MAHtSE/wCEW8P1sPji7/hz+0O/HPnTAf8AhRe/6T/+f4YzLeOOgvl6lmP6D76FHos4qIV0wzyxqTcqkjKCdheykC9gN/IY2P8Aaat/5yp/z3/qxNPkkS5fDOKcu8kDyNKapE0MJZ4haEjUwAjU7cyTj3n+WUtP1bpSyTU5awqFqQUn7J2OmM9U+qx0HcBSCDzGmViC/wBpq3/nKn/Pf+rGvW5xUTLpmnlkUG4V5GYX3F7MSL2J388XKbJ6D0qSEU8oWGkNS3/qLlz1KTBf0fZALWvve2IaTKoHSmqadXSOSo6iSKRg+lhocFXCrdWV+RFwVO5uMAdJVVHTRUVJQ1DOqv1NOmguGZ0AZRqj3X9GSSSBz3wnc4zV5ppX1Eh5GYC5tYk2291sPnOpp109UqGPTIZmZiGUBCU0ACxOq17932c5xWsPdiC7jkTVczOspxmjkOMCpjKoxXaJ0zeglxM0E3eTtiBiON2KTEM4naZaqbMLd+JODNfPFKSfG1HV+eK0qzrMsVVmp1c8R1bXagcQ81TfGu8+PVUMz1VVWIuebGaoN8R8mJ4QPGzHJJjAz4yOMa7jE6RGz715BBU2I3B8CNxjo/I6maZWklEXUyKjQaNWoo6KX62+19RNtPdjmlsPXo7mp9MKiRzUmhhLRlm0CNSyqwHqg3uDbfl472KtSvYc11dRPRVFRDDNLHolZG0SMt+rZlF9JF+/548/7TVv/OVP+e/9WN3jeNBm1YHLBPS5dRUAsAZGLaQSATYmwJGN+LhimkEU6PMkBhnmkR9BlCwEKChACkSOQgJGxV/WtvOREH/tNW/85U/57/1Yw1eeVUqlJamZ0PNXldlNtxcE254lZ8so43iYmpkiniWSFE0dZcu8TK7EEXVo2tZe1t6uNul4cpfTnoHkmd+vMKSRqmhFGxkkBJJ07llBAARjqOAJjoZl7dSniqH5Fh/3Yf8Awi94SPBz/IHHOXRFJarlF+cJ+NmT8cdD8GPdJP2h/IYytMf+6/Ba1oLFgwYMapVInidLwH3j8Mc+9MkRHox7vpB/+vHRWdpeB/IA/Ig4RfTTDemhe3qy25fWUn/txlXeHHQfVepahxoffQXT55G1NHDJSo7xRtHHL1kgZQzyyg6Q2kkNK3MeGCuz9GgaCCmjgSRlaXS8jlzHq0AdYx0gF2O2/LfG5wtwDXZhE01LGrorlDeRVIYBW5Mb8mG+Jn/c1m/9wn+cn9WNUqkBBxUwqXqHhRxJB6O8ZLAFerWE7g3Bst+fM4wVWflzAqxJDBC+tYo9RGpipdmZ2ZmYhVFybAKAAMWb/c1m/wDcJ/nJ/ViK4l6OswoYevqYlWPUFJWRWsWva4U8tufmMAdM8TCK8BkqHiJZkiQSaUneRGVUdfa8QNtwMc/QRmw92HvlOayTZZS1MMC1EpjiYRl1XtHSshDsLArdz52t34S/ENKYaqeLlolYD9m91/hIxDbyJamYUj88ZkA8cR4fHoSHEDJ0SYI8ceww8cRqy49CQ45aOsyS1eePXWHxxGiQ49iQ45cT3M3GY48azjX6w4BJjzZGZlZsa0mMpkx4Z8dJHjMDHGJhjOWF7Y8suO0cGsy4ffATTCngRoQIRSxMkusXdm1Fl0cxpGk3PPV8kZHTl2CKO0xCqPEnYfacP3IupijmmjqmmhAAtqBjh6herdUsNvUubnn9s9RDYcw8WVMYzeqeWMyxislLRh9GsCRttYBIvbmBff44y1PFcRnMqwS2kieGVGqEI6plCqkWiBREEsCuzDsjbncyThGuzVp6imiDfSEuS6r2nJaw1EX/ANRiW/3NZv8A3Cf5yf1YmIiMpeLIEe/osgEcCwU7JUBZIRqd5H1tCwMjNI3aCrp1dmxsRr5dn1JFHNGtLOOtNi61SCTqrC8RY05GktckqFuLA7A3m/8Ac1m/9wn+cn9WI3iHo2zCigaoqIkWNSASJUJ7RCiwBudzgDc6KEBq5mUEKIjYE3IBZLXIAvsOdhjoTgcfRyft25+Q/HCF6IYTeofu7Cg/4yf5DD/4LS1OT9ZyflYfdjLXHH/svx/Za0oJ/BgwY1CqY6mPUjL4gj5jCd6SaIy5dOLdpLSf4CNX8OrDmxSM/owzTQsBpdSv7rjcfI4yvaXglXb0f9lrDcVKJQvyasz7VXTE8wkyj3XSQ/bHh6Y5U6MMxNBnMSyGwMjU0n7x0D4Bwp+GOq8aqeZVDFe6Qcl9My6ppwLs0ZZB+ulnQfFlA+OLDgwApugDN+vy6WkLlXgZgCvrKk12VhfvD6/sx54p4dgkYGOoaWSILBNIxDMZI1X9Ly7RW2/ke8YrtW5yLiEyHs0lVuT3BJT2vIdXIL23Om31sOHPaGWUpHFHF1T62lkLWdWAHVFQBZrnY3PLEV0XKDUdSSuSjLiJCryCVO7UPFd/s54j+qww5gysVOxBsR4Ec8alTBHJ66KT48j8xvjMjiGvMi86lyKWsQx70jE9UZAp/Rvbyb8R+GIupyqVNyhI8V3H2ffiaNsZcyNwaNW2PmMZOC+JDw9HHk3x8LY86sAer48k4NePmrA8PLHGMnGUtjzbHqPGWDgDL5ZKkyxxdaadDMI9QXW4/RJqOykvY3P1Ti/dLebrSZPIAixPUfRBFtYNLdpuQAPZ19rvJ88fejzIo0QKJZVqIJdVSiXVSzx9iOS4s6qrg2BsGJOKNx1UHOs8hy+IkwU7FZGHLaxqGv5ABB+sPPFqEckVpvNl+6E8l9GyqEkWacmdvc9gn/41Q/E4vmPMUYUBVFgAAAOQA2Ax6x2chhQ/lH5noo6enBsZZi5HisS2N/3pFPww3scy9POc+kZoYVuVp0WIAd7ntvbzuwX9zAEl0X0wSj1HnJIxHuFk/mDh78PQ6KeIfq3/AMXa+/Cs4ayzQkFOOYCIbeJ9Y/O5w41WwAHIbYy8F8S6y3vvQtXeGEYn3BgwY1CqGILiWn9WQfsn+Y+/E7jBWU4kRlPeNvI9324r4une1OPPl+5JVPYmmcwdL+UGGsE67LOuq/g6WVvs0n3k46D6POIhX0EFRe7ldEvlImz+657Q8mGKT0hcPGrpJIgPpUOuP9tb9nn7QJX3kHuxSOgbi30WrNHKbRVJAW/JZRsv+L1ffoxB7Ou3lKi9Y8PQ7xENmea0Z0hgwYMXyApnSrwcMyoiiAdfFd4T4n2kv4MBb3hT3YqvRBxSlbSyZTXX61I2i0sSpkisUZbixDoDpPI2se4nDdwnelzgSVJfztl2pZ4zrmVOZ0/2ijxt6y8iN/G4FnznJTqZIKeREp441VywZZlC27O5csgUA6tz8r1lhid4J4wgzykanmZoqgAdakblGOkgiSJgb6SQLjmL2NwQW3c9yVnlnZIeqWMKwdnXRNqBLlRe6FbWOqwN77czQxOGbe3D6ot0X5eGRT3vgSoIxmmiIJDAgjmDzxgZcZxcCZI39dFbztv8xviPmyWJvVZl+0fj9uNkm2Bj347jKS0Zy0mQ8+Qyj1bN7jv8jiOmpnXZlYe8YtWs92PvpB7+XgcSxulzOHWinhcfCMWqWGFuaD4bfyxqtlCsfo2NzyBF7nw2/DEquXM5dbK6VxdOA+GjKzP1scdSIutpo3Go89ImaO4ugOy+djyAvucN8Fh5ZY5XQVEcQkSFkYqNeoRtLsAV1D9GDfbfwNw4u4rgyqmWap0PVGMIqooVpmUb25lYwxJNyQt+8kA3K4c2VbJ8kR/S1xx+bqTq0cGrmUrHYeoOTSkd1vZB5nxAONXoS4LNFSmonW1RUAMQRvHHzVTfcE+sfgD6uKVwZk5q5mz3OpFSBW1Rh9lcj1LKd+rXkqi5Yjv31NbhrpCy+ulMNPPeTchWVkLAbnTqAvtvYb23tichLTgwYMARnE2cpR0s1TJ6sSFrfWPJVHmzED445X4RpnrK8zS9qzmeQ+LE6h83N7eAOGF+UNxZrdMuibZCJJ7H2iPo0+AJYj9ZfDEfwDlfUU4ZgNctnO24XfQPkb2/WxVxlu7qfVktMNqQy+BaLXMZTyjG37Tbfyv88X7EVw1l3UwKp9Zu0/vPd8BYfDErj3CVbupJ68xdPalmGDBgxZIgwYMGAIDP6Ox6wDZtj7/9cc99K3DTU1QKqIERytc220Scz7tVtQ89WOn54Q6lWFwRY4o/EeSJKklPMupGFv6WXzB394xj3xeFv30fLLXv/ZcrathsPVaHvol42GY0gEh/9TCAkw2u31ZAB3N3+DA91r3nHJMMlVkeYK6ntIdjuEmjOxB8jbl3EeIBx0llnG1LPQNmCMeqRC0igXeMqLsjKPaHysQb2N8a0ZKSUloVGmnkzPxnxTDl1M1RMb90aA9qR+5R957hhA5B0nZnFUy18geaneQLMlj1S3vpWM7hGCjbxtvfnjXnlrOJMy0qQiAEqCexBECLn9ZiSL95JHIAWGzTMqWGpyHqElOo3CRl5ADaQlNPrAizAspYDwtt0eFw4g4MWqVM5yByr31tEvZYMPW0DkHG4aPkwJtzs0pwf0q09WjUObosUpBjcuNMUncQ4P6NvG+1wdxsMZuiLLpsqy2qqa4NEhPWiJtmUKtrlTyZzYaTv2RjToVy7idHLU8lNVxKNUq2I32W7bBxtyYA2BseZwAxq7h8SvEAYxTJEUCKnbB26so4OyhbjTYj7qbV5VphackwxiQx2qdMTXDaFO50kMdwbi4IxVlyzP8AI/8Ahz6XSj2QC6gf/b/SJ4nSdPiTicyjpuoZwI6+naE3F+yJY7qQQSLagbi/qm1ueIbMPCzVEkLZQ0CtyuaP14nXzKm3z5fbiOK4YWWcQ5TUVAqoquEzmLqReYqdGrXbqnI31d+m+N05ArU7xJVSlncuJyySSJqbWVUspGkeqBbYHFZ4HpInWK6oVpx7io5H3WNmHMnSbAeJPIDzw2p8rQTRzdYUWNWUxjQI3LWsz7XuttrEc/feFr8wyuCOojqayNkndnkjlqNZ7VrqiXJCC2ygbY9WD6sPFdEVOm4abroYJ2ELzhzGNLOSIwGbdOwuxHrMPji05bwgDDNG4kpn63THPDMDM0alWVg2m0eqxBUDlcEnFczjpty6nXRSRyT6RZQq9XGANgLsNQHuU4rD1PEGedlF9EpW5neNCp8WP0klx9XsnwGLEKIQ0IJWykXTpA6WqaiDRUxWoqdxYG8cZ5fSMOZB9gG+xBK4q/B3R1VZjP8AnHOixBsUhbZnA3AZdgkY7k2Jub29rBm2W0XDSxP1JrK6QMY5JBaKMrpuQt9iCR4tz7S3xK9HvS+ZJTS5ppilLEJLbQtyfUkB9UjkG5W577mYjF/xzxI1bmSQV4kpKSGQR9SqgtEg2LaRsWItuLgA9kNyOHianosuzanehnLwIYZmZWDle1qZQwsG7AB/fth39JvR3FmcWtNMdUg+jk7mHPRJbmvgeak3F9wUHw20NBWPBm1EHQ/RyBr64u8OhU7jzHMbg+ID/wAu6WMplIAqgh8JEdP4iun7cbvHnGcWX0Rqbq7OLQLf9IzC6n9kDtE+HmRiqt0f5HSKuaEt6OiiVVZ9UT6gDGQGBZibiy33JG2E7xbxBUZzXagDp9WGO+0aeJ8zzZvhyAGPG0lmwYOGcueuqmmnJZdfWSsfbZjex955+V/LD04MyszTa29SMgnbm3sj7/gPHFT4ZyLq1SngBJJ57As3tMfL+QGHPk+XLTxLGu9uZ72J5k/+eGMyGeKu235Ylp/ChlzZu4MGDGoVQwYMGADBgwYAMaeZUQlW3JhyP3Y3MGOLIRnFxloz2MnF5oVnGfCsdbEYpezItzG9t0b71O1x3924GE/kOdVmR1rXXwEsTHsTJvYg/PS9trn9ZT1HmmWiQXGzj5HyOF7xhwrDWR9XMpWRPUcesh+9Ttcd/kbHGRCc8DPYnxg9H076fwW2les15iq1vBqVoXNOHZerkvd6cN1bRueYXeynuKE6SL2NtsbXRj0dZiMxFfmF0KFm7UgaSV2BX2SbKLkkk9wAG9wux+cMkqg6MUPcwuYpl8CO8eRsRsdtjh8cAdKNLmAEbWhquXVM2zn/ANtu/wDZ5jfna+NiMlJZxfAqNNPJlP8AyieKbCPL4252lnt4D9Gp+N2I8kx56EeMcspaU08snUzszPI8gsj/AFQr7gAKBs1tybXvjSyLgOuqc9abMoSqBzUM3rRvpNokRhsR6vZO+ldwL48/lA5Xl8Bh6mFY6qUl30dldAuLsg21Mx2YC50tfHR4ZOAuNcxr86fqZSKaRjI8TjUqQpZRYX7LkaFup9ZrkEYYnSdT5VFTNU5jSpJ2lQaVAmcseSuCp2F29bkpxFdA/C3otD6S4tLVWf3RC/VD43L38HW/LFA6TM3kzjNosvpjeOOTqlI5F/7aQjvChT8EJHPAG1kfCWQZnL1dHPVwSlSwiYAgAWvuVYbX+vjPm3QfTwDXNmyQITpBmiVQTubammUE2BNvI40eHaVKLipYIhpjV2jA8mhOm/xIPvxefyhodWVqfq1CN81kX/uwBVKLoOgkj69M2SSHcmRIVK2W+o6xMRtY3PlgyXo/yFy5WunqjFG0rpF9RBdr6UJ9wDAk2AxV5eNeqyGHL4W+kleTrrHdY9RIX3uT/hBHtYdHRJwYMvoh1ijr57PNe223Zj9ygm/Pdm7rYAguiusyWomlShoRG0Kh1kmAaRgSQxUszFQOz3+13YiuBOLK3Nc5Yde4o4TJKsajSpQHRErFbFjdlazE30nbwW1fLLk+Y1kUW1lmgG+/VyqerN/EAo/vGLD0McXw5bUywVcZjE+gGVgQYyurSHB5IdfPu2vcbgC//lE5V1mXxzgbwTC58EkGk/xCPCv4mzHL6nK6WRmIzJFELBFvrSM6FMxNt9AWzbt3WI3XofjfLBV5dUwrZushYp4FgNcf8QXCL6BuHqeqqpTU05lEaBo2ZSYg1wCH9ksQwIB+qxt4AZOjDpXkotFLW6nptgj83hB5ebRgd3MDlfZcN3jnLMqkjirswVCkNnRz/aAglUI5yKTuE+4sDE9Ime5RQzLUzwxzVyJaKMW1dxUvzVQNrMwLAX033wj89z2uzmpBck29SNbiKJfG382O52HgMeNpLNhLM2uPeNajOKhURWWFWtBAPlrfuLW+Ci4HeTaOFeGhTIB60r21MBf3Kvfa/wASfgB74Y4YjphZe3KwAZrbm/sqO4X7uZ+Vm3wrwyIbSygGT2R9T8W88ZllksVLd1+Xmy1GKqW1LUzcJcPinTW4+lYb/qj6o+//AExYcGDGjXXGuOzEryk5PNhgwYMdnIYMGDABgwYMAGDBgwAY1K/L1lG+zDkw+/yxt4McTrjOOzJZo9jJxeaKFnuRK6NDUxq6N4jb3qRyPnscJzizoxmgJkoy00fPR/ar37fX+G/l346dliDAhhcHEFXZCRvEb+R5/A9+Mp4e/Cvao4x6d/jiWlZC3hPg+oiuDumOto7RVQNTENu2bTJ3bP7Vt9mBPdcYtNbluUZ9VR1KVrxTFkElPKbF0W10QEixIvujMLkm1yTiX4k4Opqq/XxWk/vF7Mg8Lm2/7wIwtM66KalLmndZhz0nsP5Dc6T8x7sWKfaNU+EvC/n6kc8PJacR6dJWaT02Xv6HDLJM46qMRRs3Vgg3chRsFUG3mVwjuCei/MKmE1UMvo0iuUQPrRjYdohlFwLm3LuOI6h4vznLSEMs6KDYJMupDbuXWDYfskYuGV9P1QotUUkUnnG7R/Ywe5+WL6aazRA1kVCOmqqLPIFrJC86VEBkfWW1KTH7bbnsG2+Hb07R3yec/VeI/wAar9+KJmnH+QVsomq6GpWbb6VSARp5ElJRe1hzU4s+fdJeR11O9NUSyiN9OodU4PZYON1B71GPQKbIuBfSsoqK6JmM0ExBj20tGqozkd+oa78+SEWucNnoJ419Kp/QpmvPTqNBPOSLkPimynyK898YOGuPeH8uiaKlklCM2tgY5GuxAUntDwUYr9Jxvw7Rz9fSUM/WqSVdbgAsCDYPLsLEi2m1jgDH+ULkDCsp6iJGYzp1ZCgkl4+XLe5VgB+xi3cXcA/nijp6oL6PXmJC3WKVBNhqSQW1CxvZrX+HKrZr0/ym4pqJFPc0shf+FQtv8WKZmXH+cV5KCaWx/s6ddAF9rEp2iP2iceN5cWBw5DmEGQ0xp6/MknK2McSreSMfVUBixUnkWAA8sLjiPpek6v0bK4VoqcbAqAJCDztp7KX8rnv1Ygcs6PamTtTsIgf3nPwG3zPwxc8j4Up6dh1cbSSX2ZhdvgOQ59wvipbjqocE838vUmjRJ68CkZFwZPUt1k5ZFY6iW3ke+5Njvv8AWb7cM3IeHwtoaSIjxt/1Ox+/4YteT8ISOdUxMafV9s/Dkvxv7sXShoY4V0xqFHf4nzJ7zivursS87OEenf5O9qFfl4si+HuG0pxqbty/W7l8l/HnidwYMaNdcYR2YrgV5ScnmwwYMGOzwMGDBgAwYMGADBgwYAMGDBgAwYMGADBgwYAxVFMjizqD7/uOIeq4dBv1bW8m3Hz/ANDidwYguwtVvnj6kkLZQ0ZTazJpALNHrHePWBHuxVcy4LoZD9JSoDzOkFD/AAWw3MeXjB5gH3i+KL9mbLzqm139Cb3nPzLMQ9R0V0THZ5k9zKR/EpP240JuiaEXtUSD3qpPy2w/XyuE/wBmvwFv5YxNkkB9j+I/jjz3fGx0sXf0G8pesRCjoohHOokI8kAxt0/RhRr6zTN73UDy9Vb/AG4d35ip/qfxN+OMkeTwLyiX47/zx77vjXrYu/oN5TyiKCj4LokHZplJv7V3v8GJGLJQ8OylQI4iq93ZCAfy/lhixQKvqqF9wA/ljJj1eznL9WbZ57wl5Y5FQo+DL7zSbfVT8T+GLFl+VQwj6JAvnzJ95O+N3Bi7VhqqvKiGVkpasMGDBic4DBgwYAMGDBgAwYMGADBgwYA//9k=" // 🔁 Replace this with your real logo link
          alt="Thal University Logo"
          style={{
            height: 48,
            width: 48,
            objectFit: "contain",
            borderRadius: "50%",
            boxShadow:
              theme === "dark"
                ? "0 0 12px rgba(77,171,247,0.3)"
                : "0 0 10px rgba(0,123,255,0.2)",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
            e.currentTarget.style.boxShadow =
              theme === "dark"
                ? "0 0 20px rgba(77,171,247,0.6)"
                : "0 0 18px rgba(0,123,255,0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow =
              theme === "dark"
                ? "0 0 12px rgba(77,171,247,0.3)"
                : "0 0 10px rgba(0,123,255,0.2)";
          }}
        />
      </div>

      {/* Center: Nav Links */}
      <div style={{ display: "flex", gap: 25 }}>
        <Link to="/quran" style={linkStyle("/quran")}>
          Quran
        </Link>
        <Link to="/library" style={linkStyle("/library")}>
          Department Books
        </Link>
        <Link to="/university-library" style={linkStyle("/university-library")}>
          Library Books
        </Link>
      </div>

      {/* Right: Theme Toggle & User */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          style={{
            background: theme === "dark" ? "#1c1f24" : "#f1f1f1",
            border: "none",
            borderRadius: 8,
            padding: "6px 12px",
            cursor: "pointer",
            color: theme === "dark" ? "#fff" : "#000",
            fontWeight: 500,
            transition: "all 0.3s ease"
            
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.boxShadow =
              theme === "dark"
                ? "0 0 8px rgba(255,255,255,0.1)"
                : "0 0 8px rgba(0,0,0,0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
        </button>

        <div style={{ fontWeight: 600 }}>{user?.username || "User"}</div>

        <button
          onClick={onLogout}
          style={{
            background: "#dc3545",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "6px 12px",
            cursor: "pointer",
            fontWeight: 600,
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.background = "#c82333";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.background = "#dc3545";
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
