// .svg é importados como texto (opção "loader" do angular.json)
declare module '*.svg' {
  const conteudo: string;
  export default conteudo;
}
