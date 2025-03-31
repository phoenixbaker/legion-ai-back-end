export type CreateContainerResponse =
  | SuccessCreateContainerResponse
  | ErrorCreateContainerResponse;

export type SuccessCreateContainerResponse = {
  success: true;
  containerId: string;
  stdout: string;
  stderr: string;
};

export type ErrorCreateContainerResponse = {
  success: false;
  error: string;
};
